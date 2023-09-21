using DnsClient.Internal;
using Mapster;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using WhichPharma.Database.Services;
using WhichPharmaPortal.Models.Client;
using WhichPharma.Services.Email;
using WhichPharma.Services.Extensions;
using WhichPharma.Services.Identity;
using WhichPharma.Services.RFQs.Exceptions;
using WhichPharma.StreakIntegration;
using WhichPharma.Utils;
using WhichPharma.Utils.Exceptions;
using WhichPharma.Utils.Extensions;
using DBSupplier = WhichPharma.Models.Database.Suppliers.Supplier;
using DBUser = WhichPharma.Models.Database.Users.User;
using DbRFQQuote = WhichPharma.Models.Database.RFQs.RFQQuote;
using System.Text.RegularExpressions;
using System.Net.Mail;

namespace WhichPharma.Services.RFQs
{
    public class RFQService : IRFQService
    {
        private readonly ILogger<RFQService> _logger;
        private readonly IRFQServiceConfiguration _config;
        private readonly IEmailService _emailService;
        private readonly ISuppliersStorage _suppliersStorage;
        private readonly IUsersStorage _usersStorage;
        private readonly IRFQsStorage _rfqsStorage;
        private readonly IStreakIntegrationClient _streakIntegrationClient;
        private readonly IIdentityService _identityService;
        private readonly SemaphoreSlim _rfqCreationSemaphore = new SemaphoreSlim(1);

        public RFQService(
            ILogger<RFQService> logger,
            IRFQServiceConfiguration config,
            IEmailService emailService,
            ISuppliersStorage suppliersStorage,
            IUsersStorage usersStorage,
            IRFQsStorage rfqsStorage,
            IStreakIntegrationClient streakIntegrationClient,
            IIdentityService identityService)
        {
            _logger = logger;
            _config = config;
            _emailService = emailService;
            _suppliersStorage = suppliersStorage;
            _usersStorage = usersStorage;
            _rfqsStorage = rfqsStorage;
            _streakIntegrationClient = streakIntegrationClient;
            _identityService = identityService;
        }

        public async Task<(IEnumerable<RFQSummary> Result, long Total)> GetRFQSummariesAsync(string assignedTo, string search, int offset, int pageSize, CancellationToken token)
        {
            var res = await _rfqsStorage.GetRFQsAsync(assignedTo, search, offset, pageSize, token);
            return (res.Result.Select(rfq => rfq.Adapt<RFQSummary>()), res.Total);
        }

        public async Task<IEnumerable<RFQSummary>> GetRFQSummariesAsync(IEnumerable<string> rfqsNrs, CancellationToken token)
        {
            var rfqs = await _rfqsStorage.GetRFQsByNumberAsync(rfqsNrs, token);
            return rfqs.Select(rfq => rfq.Adapt<RFQSummary>()).Reverse();
        }

        public async Task<IEnumerable<RFQDetails>> GetSupplierRFQsDetailsAsync(string supplierId, string supplierEmail, CancellationToken token)
        {
            var entries = await _rfqsStorage.GetSupplierRFQEntriesAsync(new ObjectId(supplierId), supplierEmail, token);

            var entriesAdapted = await AdaptRFQsDetailsAsync(entries, token);

            return entriesAdapted
                .GroupBy(entry => entry.RfqNumber)
                .Select(group => new RFQDetails
                {
                    RFQNumber = group.Key,
                    SuppliersDetails = group.Select(e => e.Details),
                });
        }

        public async Task<RFQDetails> GetRFQDetailsAsync(string rfqNumber,string SortBy ,string SortType, CancellationToken token)
        {
            var (rfq, entries) = await Tasks.WhenAll(
                _rfqsStorage.GetRFQAsync(rfqNumber, token),
                _rfqsStorage.GetRFQEntriesAsync(rfqNumber,SortBy, SortType, token));
            var cards = await _rfqsStorage.GetRFQCardsAsync(rfqNumber);
            var suppliersDetails = (await AdaptRFQsDetailsAsync(entries, token)).Select(x => x.Details);

            return new RFQDetails
            {
                RFQNumber = rfqNumber,
                Notes = rfq.Notes.Select(note => note.Adapt<RFQNote>()),
                SuppliersDetails = suppliersDetails,
                Cards = cards,
            };
        }

        public async Task<IEnumerable<RFQDetails>> GetRFQsDetailsAsync(IEnumerable<string> rfqNumbers, CancellationToken token)
        {
            var (rfqs, entries) = await Tasks.WhenAll(
                _rfqsStorage.GetRFQsByNumberAsync(rfqNumbers, token),
                _rfqsStorage.GetRFQEntriesAsync(rfqNumbers, token));

            var suppliersDetails = (await AdaptRFQsDetailsAsync(entries, token)).ToLookup(d => d.RfqNumber, d => d.Details);

            return rfqs.Select(rfq => new RFQDetails
            {
                RFQNumber = rfq.Number,
                Notes = rfq.Notes.Select(note => note.Adapt<RFQNote>()),
                SuppliersDetails = suppliersDetails[rfq.Number],
            });
        }

        public async Task<CreateRFQResult> CreateRFQsAsync(string requesterUsername, RFQRequest request, CancellationToken token)
        {
            // Get User

            var (myUser, errorReadingUser) = await _usersStorage.GetUserAsync(requesterUsername, token)
                .HandleExceptions(e => _logger.LogError(e, "Error getting user"));

            if (errorReadingUser) return CreateRFQResult.ErrorAccessingDatabase;

            if (myUser == null)
            {
                throw new RFQCreationException(RFQCreationError.UserNotFoundInDatabase);
            }

            // Get Suppliers

            var (suppliers, errorReadingSuppliers) = await _suppliersStorage
                .GetSuppliersByIdAsync(request.EmailsData.Select(data => new ObjectId(data.SupplierId)), token)
                .HandleExceptions(e => _logger.LogError(e, "Error getting suppliers"));

            if (errorReadingSuppliers) return CreateRFQResult.ErrorAccessingDatabase;

            var suppliersDic = suppliers.ToDictionary(v => v.Id.ToString());


            // Lock concurrent requests from here on to avoid duplicated RFQs numbers
            await _rfqCreationSemaphore.WaitAsync(token);

            try
            {
                // Validate RFQ Numbers

                var (newNumbersOk, existingNumbersOk) = await Tasks.WhenAll(
                    ValidateNewRfqNumbersAsync(request, token),
                    ValidateExistingRfqNumbersAsync(request.RfqNumbersToAssignToExistingOnes, token));

                if (!newNumbersOk) return CreateRFQResult.RfqNumberIsAlreadyInUse;
                if (!existingNumbersOk) return CreateRFQResult.ExistingRfqNotFound;

                // Send Emails

                var (dataWithThreadIds, errorSendingEmails) = await SendEmailsAsync(myUser, request, suppliersDic, token)
                    .ToListAsync().AsTask()
                    .HandleExceptions(e => _logger.LogError(e, "Error sending emails"));

                if (errorSendingEmails) return CreateRFQResult.ErrorSendingEmails;

                // Create in Streak and Save in DB
                var isDev = request.EmailsData.Any(i => i.Subject.Contains("Dev"));

                var (errorCreatingInStreak, errorSavingInDB) = await Tasks.WhenAll(
                    CreateStreakBoxesAsync(myUser.StreakApiKey, myUser.Email, dataWithThreadIds, token,isDev)
                        .HandleExceptions(e => _logger.LogError(e, "Error creating RFQ in Streak")),
                    SaveRfqsInDatabaseAsync(myUser, suppliersDic, dataWithThreadIds, token)
                        .HandleExceptions(e => _logger.LogError(e, "Error creating RFQ in Database")));

                return errorCreatingInStreak ? CreateRFQResult.EmailsSentButErrorIntegratingWithStreak
                    : errorSavingInDB ? CreateRFQResult.EmailsSentButErrorSavingInDatabase
                    : CreateRFQResult.Created;
            }
            finally
            {
                _rfqCreationSemaphore.Release();
            }
        }

        public async Task<RFQUpdateError> ChangeAssigneeAsync(string rfqNumber, string username, CancellationToken token)
        {
            var user = await _usersStorage.GetUserAsync(username, token);

            if (user == null) return RFQUpdateError.UserNotFound;
            if (!user.Roles.Contains(UserRole.Collaborator.ToString())) return RFQUpdateError.UserIsNotACollaborator;

            await _rfqsStorage.UpdateAssigneeAsync(rfqNumber, username, token);

            return RFQUpdateError.None;
        }

        private static IEnumerable<DbRFQQuote> MergeQuotes(string username, IEnumerable<DbRFQQuote> existingData, IEnumerable<RFQQuote> newData)
        {
            var rowIds = existingData
                    .Select(row => row.Id)
                    .Union(newData.Select(row => row.Id))
                    .Distinct();

            return rowIds.Select(rowId =>
            {
                var existingRow = existingData.FirstOrDefault(row => row.Id == rowId);
                var newRow = newData.FirstOrDefault(row => row.Id == rowId);

                return newRow == null ? existingRow
                    : existingRow == null ? newRow.Adapt<RFQQuote, DbRFQQuote>().CreatedBy(username)
                    : newRow.Adapt(existingRow).UpdatedBy(username);
            });
        }

        public async Task<RFQUpdateError> ChangeRFQTableDataAsync(
            string username,
            string rfqNumber,
            IDictionary<string, IEnumerable<RFQQuote>> dataByThreadId,
            CancellationToken token)
        {
            var (user, rfq, entries) = await Tasks.WhenAll(
                _usersStorage.GetUserAsync(username, token),
                _rfqsStorage.GetRFQAsync(rfqNumber, token),
                _rfqsStorage.GetRFQEntriesAsync(rfqNumber,null,null, token));

            if (user == null) return RFQUpdateError.UserNotFound;

            if (!user.Roles.Contains(UserRole.Administrator.ToString()) && rfq.AssigneeUsername != user.Username)
            {
                return RFQUpdateError.UserIsNotAllowed;
            }

            if (dataByThreadId.Keys.Any(threadId => entries.All(entry => entry.ThreadId != threadId)))
            {
                return RFQUpdateError.ThreadNotFound;
            }

            var dbDataByThreadId = dataByThreadId.Keys.ToDictionary(threadId => threadId, threadId =>
            {
                var existingData = entries.First(e => e.ThreadId == threadId).DataTable;
                var newData = dataByThreadId[threadId];
                return MergeQuotes(username, existingData, newData);
            });

            await Task.WhenAll(dbDataByThreadId.Keys.Select(threadId =>
                _rfqsStorage.UpdateRFQEntryDataAsync(rfqNumber, threadId, dbDataByThreadId[threadId], token)));

            entries = await _rfqsStorage.GetRFQEntriesAsync(rfqNumber,null,null,token);
            if (entries.All(i=>TestIfClosed(i)))
            {
                rfq.State = Models.Database.RFQs.RFQState.ClosedWithoutQuote;
                await _rfqsStorage.UpdateRFQ(rfq, token);
            }

            return RFQUpdateError.None;
        }

        private bool TestIfClosed(Models.Database.RFQs.RFQEntry i)
        {
            if (i.State==Models.Database.RFQs.RFQEntryState.Closed)
            {
                return true;
            }
            if (i.DataTable.All(i => i.State == Models.Database.RFQs.RFQQuoteState.Closed))
            {
                return true;
            }

            return false;

        }

        public async Task<RFQUpdateError> UpdateRFQSupplierTableDataAsync(
            string rfqNumber,
            string supplierId,
            string supplierEmail,
            IEnumerable<RFQQuote> data,
            string dueDate,
            bool sendEmailConfirmingChange,
         //   string attachedFile,
            CancellationToken token)
        {
            var (rfq, entries) = await Tasks.WhenAll(
                _rfqsStorage.GetRFQAsync(rfqNumber, token),
                _rfqsStorage.GetRFQEntriesAsync(rfqNumber,null,null, token));

            var supplierObjectId = new ObjectId(supplierId);

            _logger.LogInformation("Update data table of RFQ {ID} from supplier {Sup}",rfqNumber,supplierEmail);
            var (assignedUser, supplier) = await Tasks.WhenAll(
                _usersStorage.GetUserAsync(rfq.AssigneeUsername, token),
                _suppliersStorage.GetSupplierByIdAsync(supplierObjectId, token));

            // Check Supplier
            if (supplier == null)
            {
                _logger.LogWarning("Supplier not found: {SupplierId} - {SupplierEmail}", supplierId, supplierEmail);
                return RFQUpdateError.SupplierEntryNotFound;
            }

            // Check Contact
            var contact = supplier.Contacts.FirstOrDefault(c => c.Emails.Contains(supplierEmail));
            if (contact == null)
            {
                _logger.LogWarning("Supplier contact not found: ({SupplierId}) {SupplierName} - {SupplierEmail}", supplierId, supplier.Name, supplierEmail);
                return RFQUpdateError.SupplierEntryNotFound;
            }

            // Check RFQ entry
            var supplierEntry = entries.FirstOrDefault(entry => entry.SupplierId == supplierObjectId && entry.SupplierEmail == supplierEmail);
            if (supplierEntry == null)
            {
                _logger.LogWarning("Supplier RFQ entry not found: RFQ {RFQNumber} - ({SupplierId}) {SupplierName} - {SupplierEmail}",
                    rfqNumber, supplierId, supplier.Name, supplierEmail);
                return RFQUpdateError.SupplierEntryNotFound;
            }

            // Save in database
            var dbData = MergeQuotes($"supplier-{supplierId}", supplierEntry.DataTable, data);

            await _rfqsStorage.AddHistoryDataAsinc(entries);
            await _rfqsStorage.UpdateRFQEntryDataAsync(rfqNumber, supplierEntry.ThreadId, dbData, token);

            entries = await _rfqsStorage.GetRFQEntriesAsync(rfqNumber, null, null, token);
            if (entries.All(i => TestIfClosed(i)))
            {
                rfq.State = Models.Database.RFQs.RFQState.ClosedWithoutQuote;
                await _rfqsStorage.UpdateRFQ(rfq, token);
            }


            // Send confirmation email
            var dataWithSubmittedQuote = data;

            if (sendEmailConfirmingChange && dataWithSubmittedQuote.Any())
            {
                var contactName = string.IsNullOrEmpty(contact.FirstName)
                    ? HTranslations.GetSirMadam(supplier.Country)
                    : contact.FirstName + ' ' + (contact.LastName ?? "");

                var body = new EmailBodyBuilder()
                    .WithSupplierData(supplier)
                    .WithTemplate(QUOTE_SUBMITTED_EMAIL_TEMPLATE_FOR_SUPPLIER)
                    .WithTableData(dataWithSubmittedQuote)
                    .WithVerifyUnknownPlaceholders(false)
                    .ShowDataAsText(true)
                    .BuildHtml(supplierEmail, supplierId);

                await _emailService.SendEmailFromWhichPharmaAccountThroughGoogleApiAsync(
                    to: new (string Email, string Name)[] { (_config.Testing ? "andrei.tudos@rbpharma.pt" : supplierEmail, contactName.Trim()) },
                    cc: Enumerable.Empty<(string, string)>(),
                    subject: $"RFQ {rfqNumber} - {HTranslations.GetThankyouForYourQuote(supplier.Country)}",
                    body,
                    //attachedFile,
                    token);
            }

            if (assignedUser != null && !string.IsNullOrWhiteSpace(assignedUser.Email) && dataWithSubmittedQuote.Any())
            {
                var contactName = string.IsNullOrEmpty(contact.FirstName)
                    ? HTranslations.GetSirMadam(supplier.Country)
                    : contact.FirstName + ' ' + (contact.LastName ?? "");

                var body = new EmailBodyBuilder()
                    .WithSupplierData(supplier)
                    .WithMyUser(assignedUser)
                    .WithTemplate(QUOTE_SUBMITTED_EMAIL_TEMPLATE_FOR_COLLABORATOR)
                    .WithTableData(dataWithSubmittedQuote)
                    .WithVerifyUnknownPlaceholders(false)
                    .ShowDataAsText(true)
                    .BuildHtml(supplierEmail, supplierId);
                _logger.LogInformation("Send email to creator of RFQ {ID} from Suplier {Supllier}", rfqNumber,supplierEmail);
                await _emailService.SendEmailFromWhichPharmaAccountThroughGoogleApiAsync(
                    to: new (string Email, string Name)[] { (assignedUser.Email, Name: assignedUser.FirstName) },
                    cc: Enumerable.Empty<(string, string)>(),
                    subject: $"RFQ {rfqNumber} - {contactName} has submmited a quote",
                    body,
                    //attachedFile,
                    token);
                await _emailService.SendEmailFromWhichPharmaAccountThroughGoogleApiAsync(
                    to: new (string Email, string Name)[] { (assignedUser.Email, Name: assignedUser.FirstName) },
                    cc: Enumerable.Empty<(string, string)>(),
                    subject: $"RFQ {rfqNumber} - {contactName} has submmited a quote",
                    body,
                    //attachedFile,
                    CancellationToken.None);
            }

            return RFQUpdateError.None;
        }

        private string GenerateExternalAccessPartialLink(IEnumerable<string> rfqNrs, string supplierId, string supplierEmail)
        {
            var token = _identityService.GenerateJWTForExternalUsers(supplierId, supplierEmail, DateTime.UtcNow.AddDays(7));
            return $"/replyform?token=" + token + string.Join("", rfqNrs.Select(rfqNr => "&rfqsNrs=" + HttpUtility.UrlEncode(rfqNr)));
        }

        private string GenerateExternalAccessLink(IEnumerable<string> rfqNrs, string supplierId, string supplierEmail)
        {
            return _config.ReplyFormUrlBase + GenerateExternalAccessPartialLink(rfqNrs, supplierId, supplierEmail);
        }

        private async Task<IEnumerable<(string RfqNumber, RFQSupplierDetails Details)>> AdaptRFQsDetailsAsync(IEnumerable<Models.Database.RFQs.RFQEntry> entries, CancellationToken token)
        {
            var suppliers = (await _suppliersStorage.GetSuppliersByIdAsync(entries.Select(entry => entry.SupplierId), token)).ToDictionary(s => s.Id);
            return await Task.WhenAll(entries.Select(async entry =>
            {
                var supplier = suppliers[entry.SupplierId];
                var contact = supplier?.Contacts?.FirstOrDefault(c => c.Emails.Contains(entry.SupplierEmail));
                var supplierDetails = entry.Adapt<RFQSupplierDetails>();
                supplierDetails.Country = CountryList.GetName(supplierDetails.CountryCode);
                supplierDetails.SupplierName = supplier?.Name;
                supplierDetails.SupplierContactEmail = entry.SupplierEmail;
                supplierDetails.SupplierType = supplier?.Type.ToString();
                supplierDetails.SupplierContactName = string.Join(' ', new string[] { contact?.FirstName, contact?.LastName }.Where(s => s != null));
                supplierDetails.UnreadMessages = (int)(await _rfqsStorage.GetRFQUnreadMessagesCountAsync(entry.ThreadId, token));
                supplierDetails.ExternalAccessLink = GenerateExternalAccessPartialLink(new string[] { entry.RfqNumber }, entry.SupplierId.ToString(), entry.SupplierEmail);
                return (entry.RfqNumber, Details: supplierDetails);
            }));
        }

        private async IAsyncEnumerable<(RFQEmailData Data, string Body, string ThreadId)> SendEmailsAsync(
            DBUser myUser,
            RFQRequest request,
            Dictionary<string, DBSupplier> suppliers,
            [EnumeratorCancellation] CancellationToken token)
        {
            var emailsData = request.EmailsData
                .Where(data => data.TableData.Any() && !string.IsNullOrEmpty(data.Recipient))
                .Select(data => { data.Subject = data.Subject.Replace("\n","").Trim(); return data; })
                .ToList();

            _logger.LogDebug("Sending {NrEmails} e-mails...", emailsData.Count());

            var bodyBuilder = new EmailBodyBuilder()
                .WithSuppliersData(suppliers)
                .WithMyUser(myUser);

            var emailsDataWithBody = emailsData.Select(data =>
            {
                var allRfqs = data.TableData.Select(row => row.RfqNr).Distinct();

                var body = bodyBuilder.BuildHtml(
                    recipient: data.Recipient,
                    supplierId: data.SupplierId,
                    template: data.EmailTemplate,
                    tableData: data.TableData,
                    dueDate: data.TableData.First().EndingDate.ToString(),
                    replyFormUrl: GenerateExternalAccessLink(allRfqs, data.SupplierId, data.Recipient));

                return (Data: data, Body: body);
            }).ToArray();

            foreach (var item in emailsDataWithBody)
            {
                yield return (
                    item.Data,
                    item.Body,
                    ThreadId: await SendEmailAndGetThreadIdAsync(myUser, request, item.Data, item.Body, token));
            }

            _logger.LogDebug("{NrEmails} e-mails sent!", emailsData.Count());
        }

        private async Task<string> SendEmailAndGetThreadIdAsync(
            DBUser myUser,
            RFQRequest request,
            RFQEmailData data,
            string body,
            CancellationToken token)
        {
            try
            {
                if (!string.IsNullOrWhiteSpace(request.SenderPassword))
                {
#pragma warning disable CS0618 // Type or member is obsolete
                    await _emailService.SendEmailThroughSMTPAsync(
                        request.SenderEmail,
                        $"{myUser.FirstName} {myUser.LastName} (RBPharma)",
                        request.SenderPassword,
                        _config.Testing
                            ? new[] { (request.SenderEmail, request.SenderEmail) }
                            : new[] { (data.Recipient, data.RecipientName) },
                        _config.Testing ? new (string, string)[0] : data.CC.Concat(_config.CC).Select(email => (email, email)),
                        data.Subject.Trim('\n').Trim(),
                        body,
                        token);
#pragma warning restore CS0618 // Type or member is obsolete

                    return null;
                }
                else if (!string.IsNullOrWhiteSpace(request.SenderGmailAccessCode))
                {
                    return await _emailService.SendEmailThroughGoogleApiAsync(
                        $"{myUser.FirstName} {myUser.LastName} (RBPharma)",
                        request.SenderGmailAccessCode,
                        _config.Testing
                            ? new[] { (myUser.Email, myUser.Email) }
                            : new[] { (data.Recipient, data.RecipientName) },
                        _config.Testing ? new (string, string)[0] : data.CC.Concat(_config.CC).Select(email => (email, email)),
                        data.Subject.Trim(),
                        body,
                        token);
                }
            }
            catch (Exception e)
            {
                _logger.LogInformation(e, "Error sending e-mail. ({Sender}, {Subject}) - {Exception}", request.SenderEmail, data.Subject, e);
                throw new RFQCreationException(RFQCreationError.UnableToConnectToYourEmailAccount);
            }
            throw new InvalidParameterException("Password or Access code must be defined", nameof(request.SenderPassword));
        }

        private async Task CreateStreakBoxesAsync(
            string streakApiKey,
            string userEmail,
            IEnumerable<(RFQEmailData Data, string Body, string ThreadId)> dataWithThreadIds,
            CancellationToken token,
            bool isDev)
        {
            if (!string.IsNullOrWhiteSpace(streakApiKey))
            {
                var infoByRfqNr = dataWithThreadIds
                   .SelectMany(email => email.Data.TableData.Select(row => (row.RfqNr, row.RfqDescription, email.ThreadId)))
                   .ToLookup(email => email.RfqNr);

                _logger.LogDebug("Creating {NrRfqs} RFQs in Streak...", infoByRfqNr.Count());

                foreach (var rfqInfo in infoByRfqNr)
                {
                    var id = isDev? "Dev " + rfqInfo.Key : rfqInfo.Key;
                    await _streakIntegrationClient.CreateRFQ(
                        streakApiKey,
                        id,
                        $"RFQ {id} - {rfqInfo.First().RfqDescription}",
                        userEmail,
                        rfqInfo.Select(d => d.ThreadId).ToArray(),
                        token);
                }

                _logger.LogDebug("{NrRfqs} RFQs created in Streak!", infoByRfqNr.Count());
            }
        }

        private async Task<bool> ValidateExistingRfqNumbersAsync(IEnumerable<string> rfqNumbersToAssignToExistingOnes, CancellationToken token)
        {
            if (!rfqNumbersToAssignToExistingOnes.Any())
            {
                return true;
            }
            var rfqs = await _rfqsStorage.GetRFQsByNumberAsync(rfqNumbersToAssignToExistingOnes, token);
            return rfqs.Count() == rfqNumbersToAssignToExistingOnes.Count();
        }

        private async Task<bool> ValidateNewRfqNumbersAsync(RFQRequest request, CancellationToken token)
        {
            var existingNumbers = request.RfqNumbersToAssignToExistingOnes?.ToList();
            var newRfqNumbers = request.EmailsData
                .SelectMany(data => data.TableData.Select(row => row.RfqNr))
                .Distinct()
                .Where(rfqNr => !(existingNumbers?.Contains(rfqNr) ?? false));

            if (!newRfqNumbers.Any())
            {
                return true;
            }

            var rfqs = await _rfqsStorage.GetRFQsByNumberAsync(newRfqNumbers, token);
            return rfqs.Count() == 0;
        }

        private async Task SaveRfqsInDatabaseAsync(
            DBUser myUser,
            IDictionary<string, DBSupplier> suppliers,
            IEnumerable<(RFQEmailData Data, string Body, string ThreadId)> emails,
            CancellationToken token)
        {
            var rfqMessages = new List<Models.Database.RFQs.RFQMessage>();
            var rfqEntries = new Dictionary<string, Models.Database.RFQs.RFQEntry>();
            var rfqsProducts = new Dictionary<string, List<string>>();
            var rfqsDescription = new Dictionary<string, string>();

            _logger.LogDebug("Saving RFQs information in Database...", emails.Count());
            DateTime? End = null;
            foreach (var email in emails)
            {
                rfqMessages.Add(new Models.Database.RFQs.RFQMessage
                {
                    RfqNumbers = email.Data.TableData.Select(row => row.RfqNr).ToArray(),
                    ThreadId = email.ThreadId,
                    From = myUser.Username,
                    To = email.Data.Recipient,
                    CC = email.Data.CC,
                    Body = email.Body,
                    IsInternal = false,
                    IsRead = true,
                    SupplierId = new ObjectId(email.Data.SupplierId),
                    Outcome = true,
                    Timestamp = DateTime.UtcNow,
                });

                foreach (var row in email.Data.TableData)
                {
                    var rfqNr = row.RfqNr;
                    var productId = row.Id;
                    End = row.EndingDate;
                    rfqEntries.TryAdd(rfqNr + email.ThreadId, new Models.Database.RFQs.RFQEntry
                    {
                        RfqNumber = rfqNr,
                        SupplierId = new ObjectId(email.Data.SupplierId),
                        LastIteration = DateTime.UtcNow,
                        State = Models.Database.RFQs.RFQEntryState.Open,
                        CountryCode = suppliers[email.Data.SupplierId].Country,
                        DataTable = email.Data.TableData
                            .Where(row => row.RfqNr == rfqNr)
                            .Select(row => row.Adapt<RFQQuote, DbRFQQuote>().CreatedBy(myUser.Username)),
                        Subject = email.Data.Subject,
                        SupplierEmail = email.Data.Recipient,
                        ThreadId = email.ThreadId,
                        EndingDate = row.EndingDate,
                    });

                    if (!rfqsProducts.TryAdd(rfqNr, new List<string> { productId }))
                    {
                        rfqsProducts[rfqNr].Add(productId);
                    }
                    rfqsDescription.TryAdd(rfqNr, row.RfqDescription);
                }
            }

            var rfqsNumbers = rfqsProducts.Select(pair => pair.Key);

            var dbRfqs = (await _rfqsStorage.GetRFQsByNumberAsync(rfqsNumbers, token)).ToDictionary(rfq => rfq.Number);

            var rfqs = rfqsNumbers.Select(rfqNr =>
            {
                var rfq = dbRfqs.ContainsKey(rfqNr) ? dbRfqs[rfqNr] : new Models.Database.RFQs.RFQ
                {
                    Number = rfqNr,
                    ProductsIds = new ObjectId[0],
                    CreationDate = DateTime.UtcNow,
                    Notes = new Models.Database.RFQs.RFQNote[0],
                    Title = $"RFQ {rfqNr} - {rfqsDescription[rfqNr]}",
                    EndingDate = End,
                };

                rfq.ProductsIds = rfq.ProductsIds
                    .Select(id => id.ToString())
                    .Concat(rfqsProducts[rfqNr])
                    .Distinct()
                    .Select(id => new ObjectId(id)).ToArray();
                rfq.AssigneeUsername = myUser.Username;
                rfq.State = Models.Database.RFQs.RFQState.Open;
                rfq.StateChangeDate = DateTime.UtcNow;

                return rfq;
            });

            await _rfqsStorage.InsertRFQsAsync(rfqs, rfqEntries.Values, rfqMessages, token);

            _logger.LogDebug("RFQs information saved in Database!", emails.Count());
        }

        public async Task<string> GetNextRFQNumberAsync(CancellationToken token)
        {
            var year = DateTime.UtcNow.Year.ToString().Substring(2, 2);
            var numberRegex = new Regex($"(?<number>\\d+)\\/{year}$");

            var latest = await _rfqsStorage.FindLatestIdWithFormatAsync(numberRegex, token);

            var currentSeqNumber = latest == null
                ? 0
                : int.Parse(numberRegex.Match(latest).Groups["number"].Value);

            return $"{currentSeqNumber + 1}/{year}";
        }
                                
        public async Task<bool> SendExternalAccessLinkEmailAsync(string contactEmail, string attachment, CancellationToken token)
        {
            var supplier = await _suppliersStorage.GetSupplierByEmailAsync(contactEmail, token);
            var contact = supplier?.Contacts?.FirstOrDefault(c => c.Emails.Contains(contactEmail));
        

            if (supplier == null || contact == null) return false;

            var url = GenerateExternalAccessLink(Enumerable.Empty<string>(), supplier.Id.ToString(), contactEmail);

            await _emailService.SendEmailFromWhichPharmaAccountThroughGoogleApiAsync(
                new[] { (contactEmail, contact.FirstName) },
                Enumerable.Empty<(string, string)>(),
                "WhichPharma access link",
                string.Format(
                    @"<div><span style=""font-family: &quot;Trebuchet MS&quot;;"">Dear {0},</span></div>
                    <div><font face=""Trebuchet MS""><br></font></div>
                    <div><font face=""Trebuchet MS"">Use the following link to access your RFQs dashboard on WhichPharma app.</font><br></div>
                    <div><br></div>
                    <div>​<a href=""{1}"" target="""">{1}</a>​</div>
                    <div><font face=""Trebuchet MS""><br></font></div>
                    <div><span style=""color: rgb(152, 0, 0);""><strong>CAUTION: </strong>Do not share this link with anyone!</span>&nbsp;</div>
                    <div >As it provides access to sensitive information, and any action made on this page will be assigned to you.</div>
                    <div ><br></div>
                    <div >Thank you,</div>
                    <div >WhichPharma support</div>", contact.FirstName, url), 
                //attachment,
                token);

            return true;
        }

        Task<bool> IRFQService.SendExternalAccessLinkEmailAsync(string contactEmail, CancellationToken token)
        {
            throw new NotImplementedException();
        }

        public async Task<RFQDetails> GetRFQDetailsHistoryAsync(string rfqNumbers, CancellationToken token)
        {
            var entry = await _rfqsStorage.GetRFQEntriesHistoryAsync(rfqNumbers, token);
            var rfq = await _rfqsStorage.GetRFQAsync(rfqNumbers, token);

            var x = (await AdaptRFQsDetailsAsync(entry,token)).Select(i=>i.Details) ;
            var x3 = x.GroupBy(I => I.SupplierId).ToList();
            return new RFQDetails
            {
                RFQNumber = rfqNumbers,
                Notes = rfq.Notes.Select(note => note.Adapt<RFQNote>()),
                SuppliersDetails = x,
            };


            //return entry;

        }

        public async Task<bool> UpdateRfqCard(string RfqNumber ,List<RFQCards> rfqCards)
        {
            return await _rfqsStorage.UpdateRfqCard(RfqNumber, rfqCards);
        }

        public async Task ChangeRFQDate(string rfqNumber, ChangeRFQDueDate rFQ,CancellationToken token)
        {
            var rf = await _rfqsStorage.GetRFQAsync(rfqNumber,token);
            rf.EndingDate = rFQ.DueDate;
            rf.Reminder = rFQ.Reminder;
            await _rfqsStorage.UpdateRFQ(rf, token); 
            var rfEntry = await _rfqsStorage.GetRFQEntriesAsync(rfqNumber, null, null, token);
            await _rfqsStorage.AddHistoryDataAsinc(rfEntry);
            foreach (var item in rfEntry)
            {
                item.EndingDate = rFQ.DueDate;
                item.Reminder = rFQ.Reminder;
                item.DataTable = item.DataTable.Select(I=> { I.EndingDate = rFQ.DueDate;return I; }).ToList();
                //await _rfqsStorage.UpdateRFQEntryAsync(item.RfqNumber, item.ThreadId, item, token);
                await _rfqsStorage.UpdateRFQEntryAsync(item.RfqNumber, item.ThreadId, item, token);
            }
            //throw new NotImplementedException();
        }

        public async Task ChangeRFQState(string rfqNumber, ChangeRFQState rFQ, CancellationToken token)
        {
            var rf = await _rfqsStorage.GetRFQAsync(rfqNumber, token);
            if (rf.EndingDate < DateTime.Now && rFQ.State == "Open")
            {
                throw new Exception("Ending Date exceding");
            }
            rf.Reason = rFQ.Reason;
            rf.StateChangeDate = DateTime.Now;
            switch (rFQ.State)
            {
                case "Cancelled": rf.State = Models.Database.RFQs.RFQState.Cancelled; break;
                case "Open": rf.State = Models.Database.RFQs.RFQState.Open; break;
                case "ClosedWithQuote": rf.State = Models.Database.RFQs.RFQState.ClosedWithQuote; break;
                case "ClosedWithoutQuote": rf.State = Models.Database.RFQs.RFQState.ClosedWithoutQuote; break;

                default:
                    break;
            }
            await _rfqsStorage.UpdateRFQ(rf, token);

            var rfEntry = await _rfqsStorage.GetRFQEntriesAsync(rfqNumber, null, null, token);
            
            await _rfqsStorage.AddHistoryDataAsinc(rfEntry);
            foreach (var item in rfEntry)
            {
                item.Reason = rFQ.Reason;
                switch (rFQ.State)
                {
                    case "Closed" : item.State = Models.Database.RFQs.RFQEntryState.Closed; item.DataTable = item.DataTable.Select(I => { I.State = Models.Database.RFQs.RFQQuoteState.Closed; return I; }).ToList(); break;
                    case "Cancelled": item.State = Models.Database.RFQs.RFQEntryState.Closed; item.DataTable = item.DataTable.Select(I => { I.State = Models.Database.RFQs.RFQQuoteState.Closed; return I; }).ToList(); break;
                    case "ClosedWithoutQuote": item.State = Models.Database.RFQs.RFQEntryState.Closed; item.DataTable = item.DataTable.Select(I => { I.State = Models.Database.RFQs.RFQQuoteState.Closed; return I; }).ToList(); break;
                    case "ClosedWithQuote": item.State = Models.Database.RFQs.RFQEntryState.Closed; item.DataTable = item.DataTable.Select(I => { I.State = Models.Database.RFQs.RFQQuoteState.Closed; return I; }).ToList(); break;
                    default:
                        break;
                }
                
                await _rfqsStorage.UpdateRFQEntryAsync(item.RfqNumber, item.ThreadId, item, token);
            }

        }

        private const string QUOTE_SUBMITTED_EMAIL_TEMPLATE_FOR_SUPPLIER = "<!doctype html><html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:v=\"urn:schemas-microsoft-com:vml\" xmlns:o=\"urn:schemas-microsoft-com:office:office\"><head><title>Your quote has been submitted</title><!--[if !mso]><!-- --><meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\"><!--<![endif]--><meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><style type=\"text/css\">#outlook a { padding:0; }          body { margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; }          table, td { border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt; }          img { border:0;height:auto;line-height:100%; outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; }          p { display:block;margin:13px 0; }</style><!--[if mso]>        <xml>        <o:OfficeDocumentSettings>          <o:AllowPNG/>          <o:PixelsPerInch>96</o:PixelsPerInch>        </o:OfficeDocumentSettings>        </xml>        <![endif]--><!--[if lte mso 11]>        <style type=\"text/css\">          .mj-outlook-group-fix { width:100% !important; }        </style>        <![endif]--><style type=\"text/css\">@media only screen and (min-width:480px) {        .mj-column-per-100 { width:100% !important; max-width: 100%; }      }</style><style type=\"text/css\">[owa] .mj-column-per-100 { width:100% !important; max-width: 100%; }</style><style type=\"text/css\">@media only screen and (max-width:480px) {      table.mj-full-width-mobile { width: 100% !important; }      td.mj-full-width-mobile { width: auto !important; }    }</style></head><body style=\"background-color:#F4F4F4;\"><div style=\"background-color:#F4F4F4;\"><!--[if mso | IE]><table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"\" style=\"width:600px;\" width=\"600\" ><tr><td style=\"line-height:0px;font-size:0px;mso-line-height-rule:exactly;\"><![endif]--><div style=\"margin:0px auto;max-width:600px;\"><table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width:100%;\"><tbody><tr><td style=\"direction:ltr;font-size:0px;padding:20px 0;padding-bottom:0px;padding-top:0px;text-align:center;\"><!--[if mso | IE]><table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\"><tr><td class=\"\" style=\"vertical-align:top;width:600px;\" ><![endif]--><div class=\"mj-column-per-100 mj-outlook-group-fix\" style=\"font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"vertical-align:top;\" width=\"100%\"><tr><td style=\"font-size:0px;word-break:break-word;\"><!--[if mso | IE]><table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\"><tr><td height=\"50\" style=\"vertical-align:top;height:50px;\"><![endif]--><div style=\"height:50px;\">&nbsp;</div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr><tr><td align=\"center\" style=\"font-size:0px;padding:10px 25px;padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px;word-break:break-word;\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"border-collapse:collapse;border-spacing:0px;\"><tbody><tr><td style=\"width:600px;\"><a href=\"https://rbpharma.pt/wordpress/wp-content/uploads/2020/04/rbpharma_imagem9-scaled.jpg\" target=\"_blank\"><img alt=\"\" height=\"auto\" src=\"https://xgimq.mjt.lu/tplimg/xgimq/b/02148/xotru.jpeg\" style=\"border:none;border-radius:px;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;\" width=\"600\"></a></td></tr></tbody></table></td></tr></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"\" style=\"width:600px;\" width=\"600\" ><tr><td style=\"line-height:0px;font-size:0px;mso-line-height-rule:exactly;\"><![endif]--><div style=\"background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;\"><table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"background:#ffffff;background-color:#ffffff;width:100%;\"><tbody><tr><td style=\"direction:ltr;font-size:0px;padding:20px 0px 20px 0px;text-align:center;\"><!--[if mso | IE]><table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\"><tr><td class=\"\" style=\"vertical-align:top;width:600px;\" ><![endif]--><div class=\"mj-column-per-100 mj-outlook-group-fix\" style=\"font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"vertical-align:top;\" width=\"100%\"><tr><td align=\"left\" style=\"font-size:0px;padding:0px 25px 0px 25px;padding-top:0px;padding-bottom:0px;word-break:break-word;\"><div style=\"font-family:Arial, sans-serif;font-size:13px;letter-spacing:normal;line-height:1;text-align:left;color:#000000;\"><h1 class=\"text-build-content\" data-testid=\"18-sB5_OuViU8\" style=\"margin-top: 10px; margin-bottom: 10px; font-weight: normal;\"><span style=\"color:#55575d;font-family:Arial;font-size:20px;line-height:22px;\"><b>Dear {supplier.first-name}, your quote has been submitted</b></span></h1></div></td></tr><tr><td align=\"left\" style=\"font-size:0px;padding:0px 25px 0px 25px;padding-top:0px;padding-bottom:0px;word-break:break-word;\"><div style=\"font-family:Arial, sans-serif;font-size:13px;letter-spacing:normal;line-height:1;text-align:left;color:#000000;\"><p class=\"text-build-content\" data-testid=\"seLK-JVUyFvy8\" style=\"margin: 10px 0; margin-top: 10px; margin-bottom: 10px;\"><span style=\"color:#55575d;font-family:Arial;font-size:13px;line-height:22px;\">{products.table}</span></p></div></td></tr><tr><td align=\"left\" style=\"font-size:0px;padding:0px 20px 0px 20px;padding-top:0px;padding-bottom:0px;word-break:break-word;\"><div style=\"font-family:Arial, sans-serif;font-size:14px;letter-spacing:normal;line-height:1;text-align:left;color:#000000;\"><p class=\"text-build-content\" style=\"text-align: center; margin: 10px 0; margin-top: 10px; margin-bottom: 10px;\" data-testid=\"UNr-LfWsv4iYJ\"><span style=\"color:#55575d;font-family:Arial, Helvetica, sans-serif;font-size:13px;\">This is an automatic e-mail, please do not reply back.</span></p></div></td></tr></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"\" style=\"width:600px;\" width=\"600\" ><tr><td style=\"line-height:0px;font-size:0px;mso-line-height-rule:exactly;\"><![endif]--><div style=\"margin:0px auto;max-width:600px;\"><table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width:100%;\"><tbody><tr><td style=\"direction:ltr;font-size:0px;padding:20px 0px 20px 0px;text-align:center;\"><!--[if mso | IE]><table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\"><tr><td class=\"\" style=\"vertical-align:top;width:600px;\" ><![endif]--><div class=\"mj-column-per-100 mj-outlook-group-fix\" style=\"font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" width=\"100%\"><tbody><tr><td style=\"vertical-align:top;padding:0;\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" width=\"100%\"><tr><td align=\"center\" style=\"font-size:0px;padding:10px 25px;padding-top:0px;padding-bottom:0px;word-break:break-word;\"><div style=\"font-family:Arial, sans-serif;font-size:11px;letter-spacing:normal;line-height:22px;text-align:center;color:#000000;\"><p style=\"margin: 10px 0;\">2020 RB Pharma, Lda.</p></div></td></tr><tr><td align=\"center\" style=\"font-size:0px;padding:10px 25px;padding-top:0px;padding-bottom:0px;word-break:break-word;\"><div style=\"font-family:Arial, sans-serif;font-size:11px;letter-spacing:normal;line-height:22px;text-align:center;color:#000000;\"><p style=\"margin: 10px 0;\">   </p></div></td></tr></table></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></div></body></html>";
        private const string QUOTE_SUBMITTED_EMAIL_TEMPLATE_FOR_COLLABORATOR = "<!doctype html><html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:v=\"urn:schemas-microsoft-com:vml\" xmlns:o=\"urn:schemas-microsoft-com:office:office\"><head><title>Your quote has been submitted</title><!--[if !mso]><!-- --><meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\"><!--<![endif]--><meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><style type=\"text/css\">#outlook a { padding:0; }          body { margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; }          table, td { border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt; }          img { border:0;height:auto;line-height:100%; outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; }          p { display:block;margin:13px 0; }</style><!--[if mso]>        <xml>        <o:OfficeDocumentSettings>          <o:AllowPNG/>          <o:PixelsPerInch>96</o:PixelsPerInch>        </o:OfficeDocumentSettings>        </xml>        <![endif]--><!--[if lte mso 11]>        <style type=\"text/css\">          .mj-outlook-group-fix { width:100% !important; }        </style>        <![endif]--><style type=\"text/css\">@media only screen and (min-width:480px) {        .mj-column-per-100 { width:100% !important; max-width: 100%; }      }</style><style type=\"text/css\">[owa] .mj-column-per-100 { width:100% !important; max-width: 100%; }</style><style type=\"text/css\">@media only screen and (max-width:480px) {      table.mj-full-width-mobile { width: 100% !important; }      td.mj-full-width-mobile { width: auto !important; }    }</style></head><body style=\"background-color:#F4F4F4;\"><div style=\"background-color:#F4F4F4;\"><!--[if mso | IE]><table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"\" style=\"width:600px;\" width=\"600\" ><tr><td style=\"line-height:0px;font-size:0px;mso-line-height-rule:exactly;\"><![endif]--><div style=\"margin:0px auto;max-width:600px;\"><table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width:100%;\"><tbody><tr><td style=\"direction:ltr;font-size:0px;padding:20px 0;padding-bottom:0px;padding-top:0px;text-align:center;\"><!--[if mso | IE]><table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\"><tr><td class=\"\" style=\"vertical-align:top;width:600px;\" ><![endif]--><div class=\"mj-column-per-100 mj-outlook-group-fix\" style=\"font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"vertical-align:top;\" width=\"100%\"><tr><td style=\"font-size:0px;word-break:break-word;\"><!--[if mso | IE]><table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\"><tr><td height=\"50\" style=\"vertical-align:top;height:50px;\"><![endif]--><div style=\"height:50px;\">&nbsp;</div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr><tr><td align=\"center\" style=\"font-size:0px;padding:10px 25px;padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px;word-break:break-word;\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"border-collapse:collapse;border-spacing:0px;\"><tbody><tr><td style=\"width:600px;\"><a href=\"https://rbpharma.pt/wordpress/wp-content/uploads/2020/04/rbpharma_imagem9-scaled.jpg\" target=\"_blank\"><img alt=\"\" height=\"auto\" src=\"https://xgimq.mjt.lu/tplimg/xgimq/b/02148/xotru.jpeg\" style=\"border:none;border-radius:px;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;\" width=\"600\"></a></td></tr></tbody></table></td></tr></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"\" style=\"width:600px;\" width=\"600\" ><tr><td style=\"line-height:0px;font-size:0px;mso-line-height-rule:exactly;\"><![endif]--><div style=\"background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;\"><table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"background:#ffffff;background-color:#ffffff;width:100%;\"><tbody><tr><td style=\"direction:ltr;font-size:0px;padding:20px 0px 20px 0px;text-align:center;\"><!--[if mso | IE]><table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\"><tr><td class=\"\" style=\"vertical-align:top;width:600px;\" ><![endif]--><div class=\"mj-column-per-100 mj-outlook-group-fix\" style=\"font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"vertical-align:top;\" width=\"100%\"><tr><td align=\"left\" style=\"font-size:0px;padding:0px 25px 0px 25px;padding-top:0px;padding-bottom:0px;word-break:break-word;\"><div style=\"font-family:Arial, sans-serif;font-size:13px;letter-spacing:normal;line-height:1;text-align:left;color:#000000;\"><h1 class=\"text-build-content\" data-testid=\"18-sB5_OuViU8\" style=\"margin-top: 10px; margin-bottom: 10px; font-weight: normal;\"><span style=\"color:#55575d;font-family:Arial;font-size:20px;line-height:22px;\"><b>Dear {user.first-name}, a new quote has been submitted</b></span></h1></div></td></tr><tr><td align=\"left\" style=\"font-size:0px;padding:0px 25px 0px 25px;padding-top:0px;padding-bottom:0px;word-break:break-word;\"><div style=\"font-family:Arial, sans-serif;font-size:13px;letter-spacing:normal;line-height:1;text-align:left;color:#000000;\"><p class=\"text-build-content\" data-testid=\"seLK-JVUyFvy8\" style=\"margin: 10px 0; margin-top: 10px; margin-bottom: 10px;\"><span style=\"color:#55575d;font-family:Arial;font-size:13px;line-height:22px;\">{products.table}</span></p></div></td></tr><tr><td align=\"left\" style=\"font-size:0px;padding:0px 20px 0px 20px;padding-top:0px;padding-bottom:0px;word-break:break-word;\"><div style=\"font-family:Arial, sans-serif;font-size:14px;letter-spacing:normal;line-height:1;text-align:left;color:#000000;\"><p class=\"text-build-content\" style=\"text-align: center; margin: 10px 0; margin-top: 10px; margin-bottom: 10px;\" data-testid=\"UNr-LfWsv4iYJ\"><span style=\"color:#55575d;font-family:Arial, Helvetica, sans-serif;font-size:13px;\">This is an automatic e-mail, please do not reply back.</span></p></div></td></tr></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"\" style=\"width:600px;\" width=\"600\" ><tr><td style=\"line-height:0px;font-size:0px;mso-line-height-rule:exactly;\"><![endif]--><div style=\"margin:0px auto;max-width:600px;\"><table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width:100%;\"><tbody><tr><td style=\"direction:ltr;font-size:0px;padding:20px 0px 20px 0px;text-align:center;\"><!--[if mso | IE]><table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\"><tr><td class=\"\" style=\"vertical-align:top;width:600px;\" ><![endif]--><div class=\"mj-column-per-100 mj-outlook-group-fix\" style=\"font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" width=\"100%\"><tbody><tr><td style=\"vertical-align:top;padding:0;\"><table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" width=\"100%\"><tr><td align=\"center\" style=\"font-size:0px;padding:10px 25px;padding-top:0px;padding-bottom:0px;word-break:break-word;\"><div style=\"font-family:Arial, sans-serif;font-size:11px;letter-spacing:normal;line-height:22px;text-align:center;color:#000000;\"><p style=\"margin: 10px 0;\">2020 RB Pharma, Lda.</p></div></td></tr><tr><td align=\"center\" style=\"font-size:0px;padding:10px 25px;padding-top:0px;padding-bottom:0px;word-break:break-word;\"><div style=\"font-family:Arial, sans-serif;font-size:11px;letter-spacing:normal;line-height:22px;text-align:center;color:#000000;\"><p style=\"margin: 10px 0;\">   </p></div></td></tr></table></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></div></body></html>";
    }
}
