using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WhichPharma.Services.RFQs.Exceptions;
using WhichPharma.Utils;
using WhichPharma.Utils.Extensions;
using WhichPharmaPortal.Models.Client;
using DBSupplier = WhichPharma.Models.Database.Suppliers.Supplier;
using DBUser = WhichPharma.Models.Database.Users.User;

namespace WhichPharma.Services.RFQs
{
    public class EmailBodyBuilder
    {
        private Dictionary<string, DBSupplier> _suppliers = new Dictionary<string, DBSupplier>();
        private DBUser _myUser;
        private string _template;
        private string _replyFormUrl;
        private string _dueDate;
        private IEnumerable<RFQQuote> _tableData;
        private bool _verifyUnknownPlaceholders = true;
        private bool _showAsText = false;

        public EmailBodyBuilder WithMyUser(DBUser user)
        {
            _myUser = user;
            return this;
        }

        public EmailBodyBuilder WithSupplierData(DBSupplier supplier)
        {
            _suppliers[supplier.Id.ToString()] = supplier;
            return this;
        }

        public EmailBodyBuilder WithSuppliersData(Dictionary<string, DBSupplier> suppliers)
        {
            _suppliers = suppliers;
            return this;
        }

        public EmailBodyBuilder WithSuppliersData(IEnumerable<DBSupplier> suppliers)
        {
            _suppliers = suppliers.ToDictionary(s => s.Id.ToString());
            return this;
        }

        public EmailBodyBuilder WithTemplate(string template)
        {
            _template = template;
            return this;
        }

        public EmailBodyBuilder WithReplyFormUrl(string replyFormUrl)
        {
            _replyFormUrl = replyFormUrl;
            return this;
        }

        public EmailBodyBuilder WithDueDate(string dueDate)
        {
            _dueDate = dueDate;
            return this;
        }

        public EmailBodyBuilder WithTableData(IEnumerable<RFQQuote> tableData)
        {
            _tableData = tableData;
            return this;
        }

        public EmailBodyBuilder WithVerifyUnknownPlaceholders(bool enabled)
        {
            _verifyUnknownPlaceholders = enabled;
            return this;
        }

        public EmailBodyBuilder ShowDataAsText(bool enabled)
        {
            _showAsText = enabled;
            return this;
        }

        public string BuildHtml(
            string recipient,
            string supplierId,
            IEnumerable<RFQQuote> tableData = null,
            string template = null,
            string replyFormUrl = null,
            string dueDate = null)
        {
            var supplier = ThrowIfNull(_suppliers.GetValueOrDefault(supplierId), RFQCreationError.SupplierNotFoundInDatabase);

            var contact = supplier.Contacts.FirstOrDefault(c => c.Emails.Contains(recipient));

            if (supplier == null)
            {
                throw new RFQCreationException(RFQCreationError.RecipientNotFoundInSupplierData);
            }

            var tableHtml = _showAsText
                ? GetInlineQuotesHtml(tableData ?? _tableData)
                : GetTableHtml(tableData ?? _tableData);

            var formatted = (template ?? _template)
                .Replace("{supplier.first-name}", () => IfNullOrWhiteSpaceDefault(contact.FirstName, HTranslations.GetSirMadam(supplier.Country)))
                .Replace("{supplier.last-name}", () => IfNullOrWhiteSpaceDefault(contact.LastName))
                .Replace("{user.first-name}", () => ThrowIfNullOrWhiteSpace(_myUser.FirstName, RFQCreationError.UserFirstNameMissing))
                .Replace("{user.last-name}", () => IfNullOrWhiteSpaceDefault(_myUser.LastName))
                .Replace("{user.email}", () => ThrowIfNullOrWhiteSpace(_myUser.Email, RFQCreationError.UserEmailMissing))
                .Replace("{user.title}", () => IfNullOrWhiteSpaceDefault(_myUser.Title))
                .Replace("{products.table}", () => ThrowIfNullOrWhiteSpace(tableHtml, RFQCreationError.ProductsTableMissing))
                .Replace("{reply-form-url}", () => ThrowIfNullOrWhiteSpace(replyFormUrl ?? _replyFormUrl, RFQCreationError.ReplyFormUrlMissing))
                .Replace("{rfq.dueDate}", () => ThrowIfNullOrWhiteSpace(dueDate ?? _dueDate, RFQCreationError.DueDateMissing))
                .Replace("\n", "<br>");

            if (_verifyUnknownPlaceholders && (formatted.Contains('{') || formatted.Contains('}')))
            {
                throw new RFQCreationException(RFQCreationError.EmailBodyContainsUnknownPlaceholder);
            }

            return formatted;
        }

        private static T ThrowIfNull<T>(T value, RFQCreationError error) where T : class => (value == null) ? throw new RFQCreationException(error) : value;
        private static string ThrowIfNullOrWhiteSpace(string value, RFQCreationError error) => string.IsNullOrWhiteSpace(value) ? throw new RFQCreationException(error) : value;
        private static string IfNullOrWhiteSpaceDefault(string value, string defaultValue = "") => string.IsNullOrWhiteSpace(value) ? defaultValue : value;

        private static readonly IDictionary<string, string> TableColumns = new Dictionary<string, string>
        {
            { nameof(RFQQuote.RfqNr),  "RFQ No" },
            { nameof(RFQQuote.ActiveSubstances) , "Active Substance(s)" },
            { nameof(RFQQuote.Name) , "Name" },
            { nameof(RFQQuote.ProductCode) , "Product code" },
            { nameof(RFQQuote.PackSize) , "Pack size" },
            { nameof(RFQQuote.UnitQuant) , "Unit Quant." },
            { nameof(RFQQuote.ExwNetPriceEuro) , "EXW Net Price €" },
            { nameof(RFQQuote.AvailabilityPacks) , "Availability (Packs)" },
            { nameof(RFQQuote.LeadTimeToDeliver) , "Lead time to deliver" },
            { nameof(RFQQuote.ExpDate) , "Exp. data" },
            { nameof(RFQQuote.CountryOfOrigin) , "Country of Origin" },
            { nameof(RFQQuote.MAHolder) , "MA Holder" },
            { nameof(RFQQuote.Comments) , "Comments" },
        };

        private string GetTableHtml(IEnumerable<RFQQuote> rows)
        {
            if (rows == null)
            {
                throw new ArgumentException("Rows cannot be null");
            }

            var builder = new StringBuilder();

            const string tableStyle = "border-collapse: collapse; display: table;";
            const string thStyle = "min-height: 1rem; padding: 0 5px; border: 1px solid black; background-color: yellow;";
            const string tdStyle = "min-height: 1rem; padding: 0 5px; border: 1px solid black;";

            builder.Append($"<table style=\"{tableStyle}\">");
            builder.Append("<tr>");
            foreach (var column in TableColumns.Keys)
            {
                builder.Append($"<th style=\"{thStyle}\">{TableColumns[column]}</th>");
            }
            builder.Append("</tr>");
            foreach (var row in rows)
            {
                builder.Append("<tr>");
                foreach (var column in TableColumns.Keys)
                {
                    builder.Append($"<td style=\"{tdStyle}\">{row.GetType().GetProperty(column)?.GetValue(row)?.ToString() ?? ""}</td>");
                }
                builder.Append("</tr>");
            }
            builder.Append("</table>");

            return builder.ToString();
        }

        private string GetInlineQuotesHtml(IEnumerable<RFQQuote> rows)
        {
            if (rows == null)
            {
                throw new ArgumentException("Rows cannot be null");
            }

            var builder = new StringBuilder();

            foreach (var row in rows)
            {
                builder.Append(GetInlineQuoteHtml(row));
            }

            return builder.ToString();
        }

        private string GetInlineQuoteHtml(RFQQuote row)
        {
            if (row == null)
            {
                throw new ArgumentException("Row cannot be null");
            }

            var builder = new StringBuilder();

            foreach (var column in TableColumns.Keys)
            {
                var val = row.GetType().GetProperty(column)?.GetValue(row)?.ToString() ?? "";

                builder.Append("<div style=\"margin: 7px\">");
                builder.Append($"<b>{TableColumns[column]}</b>: {val}");
                builder.Append("</div>");
            }

            return builder.ToString();
        }
    }
}
