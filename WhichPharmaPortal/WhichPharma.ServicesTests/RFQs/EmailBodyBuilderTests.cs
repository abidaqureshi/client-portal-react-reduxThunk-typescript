using Microsoft.VisualStudio.TestTools.UnitTesting;
using WhichPharma.Models.Database.Suppliers;
using System.Linq;
using WhichPharma.Models.Database.Users;

namespace WhichPharma.Services.RFQs.Tests
{
    [TestClass()]
    public class EmailBodyBuilderTests
    {
        [TestMethod()]
        public void BuildBodyHtml_WhenSupplierHasValidFirstName_ShouldUseIt()
        {
            // Arrange

            var template = "Dear {supplier.first-name}, coiso e tal";
            var contact = new Contact { FirstName = "Maria", Emails = new string[] { "test@test.com" } };
            var supplier = new Supplier { Id = new MongoDB.Bson.ObjectId("5f886655a67056f7ec52eccf"), Contacts = new Contact[] { contact } };
            var tableData = Enumerable.Empty<WhichPharmaPortal.Models.Client.RFQQuote>();
            var replyFormUrl = "http://test-form-url.com";
            var dueDate = "05/05/2021";

            var suppliers = new Supplier[] { supplier }.ToDictionary(s => s.Id.ToString());
            var user = new User { };

            var builder = new EmailBodyBuilder()
                .WithSuppliersData(suppliers)
                .WithMyUser(user)
                .WithTemplate(template)
                .WithTableData(tableData)
                .WithReplyFormUrl(replyFormUrl)
                .WithDueDate(dueDate);

            // Act

            var res = builder.BuildHtml(contact.Emails[0], supplier.Id.ToString());

            // Assert

            StringAssert.StartsWith(res, "Dear Maria");
        }

        [TestMethod()]
        public void BuildBodyHtml_WhenSupplierHasNoFirstName_ShouldUseSirOrMadam()
        {
            // Arrange

            var template = "Dear {supplier.first-name}, coiso e tal";
            var contact = new Contact { FirstName = null, Emails = new string[] { "test@test.com" } };
            var supplier = new Supplier { Id = new MongoDB.Bson.ObjectId("5f886655a67056f7ec52eccf"), Contacts = new Contact[] { contact } };
            var tableData = Enumerable.Empty<WhichPharmaPortal.Models.Client.RFQQuote>();
            var replyFormUrl = "http://test-form-url.com";

            var suppliers = new Supplier[] { supplier }.ToDictionary(s => s.Id.ToString());
            var user = new User { };
            var dueDate = "05/05/2021";

            var builder = new EmailBodyBuilder()
                .WithSuppliersData(suppliers)
                .WithMyUser(user)
                .WithTemplate(template)
                .WithTableData(tableData)
                .WithReplyFormUrl(replyFormUrl)
                .WithDueDate(dueDate);

            // Act

            var res = builder.BuildHtml(contact.Emails[0], supplier.Id.ToString());

            // Assert

            StringAssert.StartsWith(res, "Dear Sir/Madam");
        }

        [TestMethod()]
        public void BuildBodyHtml_WhenSupplierFromPortugalHasNoFirstName_ShouldUseSrOrSra()
        {
            // Arrange

            var template = "Olá {supplier.first-name}, coiso e tal";
            var contact = new Contact { FirstName = null, Emails = new string[] { "test@test.com" } };
            var supplier = new Supplier { Id = new MongoDB.Bson.ObjectId("5f886655a67056f7ec52eccf"), Country = "PT", Contacts = new Contact[] { contact } };
            var tableData = Enumerable.Empty<WhichPharmaPortal.Models.Client.RFQQuote>();
            var replyFormUrl = "http://test-form-url.com";
            var dueDate = "05/05/2021";

            var suppliers = new Supplier[] { supplier }.ToDictionary(s => s.Id.ToString());
            var user = new User { };

            var builder = new EmailBodyBuilder()
                .WithSuppliersData(suppliers)
                .WithMyUser(user)
                .WithTemplate(template)
                .WithTableData(tableData)
                .WithReplyFormUrl(replyFormUrl)
                .WithDueDate(dueDate);

            // Act

            var res = builder.BuildHtml(contact.Emails[0], supplier.Id.ToString());

            // Assert

            StringAssert.StartsWith(res, "Olá Sr./Sra");
        }
    }
}