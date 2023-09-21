using MongoDB.Bson;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Database.Config;
using WhichPharma.Database.Utils;
using WhichPharma.Models.Database.RFQs;
using WhichPharma.Utils;

namespace WhichPharma.Database.Services.Implementations
{
    public class RFQsStorage : IRFQsStorage
    {
        private const string RFQ_COLLECTION_NAME = "rfqs";
        private const string RFQ_ENTRIES_COLLECTION_NAME = "rfqsEntries";
        private const string RFQ_CARDS = "rfqsCards";
        private const string RFQ_ENTRIES_HISTORY_COLLECTION_NAME = "rfqsEntries-history";
        private const string RFQ_MESSAGES_COLLECTION_NAME = "rfqsMessages";

        private readonly IMongoCollection<RFQ> _rfqCollection;
        private readonly IMongoCollection<RFQEntry> _rfqEntriesCollection;
        private readonly IMongoCollection<RFQEntry> _rfqEntriesHistoryCollection;
        private readonly IMongoCollection<RFQMessage> _rfqMessagesCollection;
        private readonly IMongoCollection<WhichPharmaPortal.Models.Client.DBRFQCards> _rfqCrdsCollection;

        public RFQsStorage(IStorageConfig<RFQsStorage> config)
        {
            var database = new MongoClient(config.ConnectionString).GetDatabase(config.DatabaseName);
            _rfqCollection = database.GetCollection<RFQ>(RFQ_COLLECTION_NAME);
            _rfqEntriesCollection = database.GetCollection<RFQEntry>(RFQ_ENTRIES_COLLECTION_NAME);
            _rfqEntriesHistoryCollection = database.GetCollection<RFQEntry>(RFQ_ENTRIES_HISTORY_COLLECTION_NAME);
            _rfqMessagesCollection = database.GetCollection<RFQMessage>(RFQ_MESSAGES_COLLECTION_NAME);
            _rfqCrdsCollection = database.GetCollection<WhichPharmaPortal.Models.Client.DBRFQCards>(RFQ_CARDS);
        }

        public Task InsertRFQsAsync(IEnumerable<RFQ> rfqs, IEnumerable<RFQEntry> entries, IEnumerable<RFQMessage> messages, CancellationToken token)
        {
            var insertOrUpdateRfqs = Task.WhenAll(rfqs.Select(rfq => _rfqCollection.ReplaceOneAsync(
                item => item.Number == rfq.Number,
                rfq,
                new ReplaceOptions { IsUpsert = true },
                token)));

            return Task.WhenAll(
                _rfqMessagesCollection.InsertManyAsync(messages, new InsertManyOptions(), token),
                _rfqEntriesCollection.InsertManyAsync(entries, new InsertManyOptions(), token),
                insertOrUpdateRfqs);
        }

        public Task<(List<RFQ> Result, long Total)> GetRFQsAsync(string assignedTo, string search, int offset, int pageSize, CancellationToken token)
        {
            //var freeTextFilter = string.IsNullOrWhiteSpace(search) ? null : Builders<RFQ>.Filter.Text(search, new TextSearchOptions
            //{
            //    CaseSensitive = false,
            //    DiacriticSensitive = false,
            //});

            var freeTextFilter = string.IsNullOrWhiteSpace(search) ? null : Builders<RFQ>.Filter.Or(
                new DynamicFilterBuilder<RFQ>().Contains(rfq => rfq.Number, search).Build(),
                new DynamicFilterBuilder<RFQ>().Contains(rfq => rfq.Title, search).Build());

            var query = new DynamicFilterBuilder<RFQ>()
                .EqualIfNotNull(rfq => rfq.AssigneeUsername, assignedTo)
                .CustomIfNotNull(freeTextFilter)
                .Build();

            var resultTask = _rfqCollection
                .Find(query)
                .SortByDescending(rfq => rfq.CreationDate)
                .Skip(offset)
                .Limit(pageSize)
                .ToListAsync(token);

            var totalTask = _rfqCollection.Find(query).CountDocumentsAsync(token);

            return Tasks.WhenAll(resultTask, totalTask);
        }

        public Task<List<RFQ>> GetRFQsByNumberAsync(IEnumerable<string> rfqNumbers, CancellationToken token)
        {
            return _rfqCollection.Find(rfq => rfqNumbers.Contains(rfq.Number)).ToListAsync(token);
        }

        public Task<RFQ> GetRFQAsync(string rfqNumber, CancellationToken token)
        {
            return _rfqCollection.Find(rfq => rfq.Number == rfqNumber).FirstOrDefaultAsync(token);
        }

        public Task<List<RFQEntry>> GetRFQEntriesAsync(string rfqNumber,string sortBy,string sortType, CancellationToken token)
        {
            var r = _rfqEntriesCollection.Find(entry => entry.RfqNumber == rfqNumber);
            if (!string.IsNullOrWhiteSpace(sortBy))
            {
                var s = typeof(RFQEntry).GetProperties().FirstOrDefault(i => i.Name.ToLowerInvariant() == sortBy.ToLowerInvariant());
                if (s!=null)
                {
                    var s2 = sortType==null || sortType=="asc" ?
                        Builders<RFQEntry>.Sort.Ascending(s.Name):
                        Builders<RFQEntry>.Sort.Descending(s.Name)
                        ;
                    r = r.Sort(s2);
                }

            }
            else
            {
                r = r.SortByDescending(I => I.LastIteration);
            }
                


            return r.ToListAsync(token);
        }

        public Task<List<RFQEntry>> GetRFQEntriesAsync(IEnumerable<string> rfqNumbers, CancellationToken token)
        {
            var r = _rfqEntriesCollection.Find(entry => rfqNumbers.Contains(entry.RfqNumber)).ToList();
            return _rfqEntriesCollection.Find(entry => rfqNumbers.Contains(entry.RfqNumber)).ToListAsync(token);
        }

        public Task<List<RFQEntry>> GetSupplierRFQEntriesAsync(ObjectId supplierId, string supplierEmail, CancellationToken token)
        {
            return _rfqEntriesCollection
                .Find(entry => entry.SupplierId == supplierId && entry.SupplierEmail == supplierEmail)
                .SortByDescending(entry => entry.LastIteration)
                .Limit(100)
                .ToListAsync(token);
        }

        public Task<List<RFQMessage>> GetRFQMessagesAsync(string threadId, CancellationToken token)
        {
            return _rfqMessagesCollection.Find(msg => msg.ThreadId == threadId).ToListAsync(token);
        }

        public Task<long> GetRFQUnreadMessagesCountAsync(string threadId, CancellationToken token)
        {
            return _rfqMessagesCollection.Find(msg => msg.ThreadId == threadId && !msg.IsRead).CountDocumentsAsync(token);
        }

        public Task UpdateAssigneeAsync(string rfqNumber, string username, CancellationToken token)
        {
            return _rfqCollection.UpdateOneAsync(
                rfq => rfq.Number == rfqNumber,
                string.IsNullOrWhiteSpace(username)
                    ? Builders<RFQ>.Update.Unset(rfq => rfq.AssigneeUsername)
                    : Builders<RFQ>.Update.Set(rfq => rfq.AssigneeUsername, username),
                new UpdateOptions(),
                token);
        }

        public Task UpdateRFQEntryDataAsync(string rfqNr, string threadId, IEnumerable<RFQQuote> data, CancellationToken token)
        {
            return _rfqEntriesCollection.UpdateOneAsync(
                entry => entry.RfqNumber == rfqNr && entry.ThreadId == threadId,
                Builders<RFQEntry>.Update.Set(entry => entry.DataTable, data.ToArray()),
                new UpdateOptions(),
                token);
        }
        public Task UpdateRFQEntryEndingDateAsync(string rfqNr, string threadId, BsonDateTime date, CancellationToken token)
        {
            return _rfqEntriesCollection.UpdateOneAsync(
                entry => entry.RfqNumber == rfqNr && entry.ThreadId == threadId,
                Builders<RFQEntry>.Update.Set(d=>d.DataTable.First().EndingDate, date),
                new UpdateOptions(),
                token);
        }
        public async Task<string> FindLatestIdWithFormatAsync(Regex rfqNrPattern, CancellationToken token)
        {
            return (await _rfqCollection
                .Find(Builders<RFQ>.Filter.Regex(rfq => rfq.Number, new BsonRegularExpression(rfqNrPattern)))
                .SortByDescending(rfq => rfq.CreationDate)
                //.FirstOrDefaultAsync(token))?.Number;
                .Project(rfq => rfq.Number).ToListAsync())
                .OrderByDescending(id => int.Parse(rfqNrPattern.Match(id).Groups["number"].Value))
                .FirstOrDefault();
        }

        public async Task AddHistoryDataAsinc(List<RFQEntry> entries)
        {
            await _rfqEntriesHistoryCollection.InsertManyAsync(entries);

            //throw new System.NotImplementedException();
        }

        public  Task<List<RFQEntry>> GetRFQEntriesHistoryAsync(string rfqNumbers, CancellationToken token)
        {
            return _rfqEntriesHistoryCollection.Find(i => i.RfqNumber == rfqNumbers).ToListAsync(token);


            
        }

        public async Task<bool> UpdateRfqCard(string RfqNumber, List<WhichPharmaPortal.Models.Client.RFQCards> rfqCards)
        {
            await Task.Delay(0);
            _rfqCrdsCollection.ReplaceOne(i => i.RfqNumber == RfqNumber, new WhichPharmaPortal.Models.Client.DBRFQCards
            {
                RfqNumber = RfqNumber,
                Cards = rfqCards
            }, new ReplaceOptions { IsUpsert = true });

            return true;
        }

        public async Task<List<WhichPharmaPortal.Models.Client.RFQCards>> GetRFQCardsAsync(string rfqNumber)
        {
            await Task.Delay(0);
            return _rfqCrdsCollection.Find(I => I.RfqNumber == rfqNumber).FirstOrDefault()?.Cards;
        }

        public async Task UpdateRFQ(RFQ rf, CancellationToken token)
        {
            await _rfqCollection.ReplaceOneAsync(I => I.Number == rf.Number, rf);
        }

        public Task UpdateRFQEntryAsync(string rfqNumber, string threadId, RFQEntry dataTable, CancellationToken token)
        {
            return _rfqEntriesCollection.ReplaceOneAsync(
                entry => entry.RfqNumber == rfqNumber && entry.ThreadId == threadId, dataTable);
        }
    }
}
