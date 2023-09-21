using MongoDB.Bson;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Models.Database.RFQs;

namespace WhichPharma.Database.Services
{
    public interface IRFQsStorage
    {
        Task InsertRFQsAsync(IEnumerable<RFQ> rfqs, IEnumerable<RFQEntry> entries, IEnumerable<RFQMessage> messages, CancellationToken token);
        Task<(List<RFQ> Result, long Total)> GetRFQsAsync(string assignedTo, string search, int offset, int pageSize, CancellationToken token);
        Task<List<RFQ>> GetRFQsByNumberAsync(IEnumerable<string> rfqNumbers, CancellationToken token);
        Task<RFQ> GetRFQAsync(string rfqNumber, CancellationToken token);
        Task<List<RFQEntry>> GetRFQEntriesAsync(string rfqNumber, string sortBy, string sortType, CancellationToken token);
        Task<List<RFQEntry>> GetRFQEntriesAsync(IEnumerable<string> rfqNumbers, CancellationToken token);
        Task<List<RFQEntry>> GetSupplierRFQEntriesAsync(ObjectId supplierId, string supplierEmail, CancellationToken token);
        Task<List<RFQMessage>> GetRFQMessagesAsync(string threadId, CancellationToken token);
        Task<long> GetRFQUnreadMessagesCountAsync(string threadId, CancellationToken token);
        Task UpdateAssigneeAsync(string rfqNumber, string username, CancellationToken token);
        Task UpdateRFQEntryDataAsync(string rfqNumber, string threadId, IEnumerable<RFQQuote> data, CancellationToken token);
        Task UpdateRFQEntryEndingDateAsync(string rfqNumber, string threadId, BsonDateTime date, CancellationToken token);
        Task<string> FindLatestIdWithFormatAsync(Regex rfqNrPattern, CancellationToken token);
        Task AddHistoryDataAsinc(List<RFQEntry> entries);
        Task<List<RFQEntry>> GetRFQEntriesHistoryAsync(string rfqNumbers, CancellationToken token);
        Task<bool> UpdateRfqCard(string RfqNumber,List<WhichPharmaPortal.Models.Client.RFQCards> rfqCards);
        Task<List<WhichPharmaPortal.Models.Client.RFQCards>> GetRFQCardsAsync(string rfqNumber);
        Task UpdateRFQ(RFQ rf, CancellationToken token);
        Task UpdateRFQEntryAsync(string rfqNumber, string threadId, RFQEntry dataTable, CancellationToken token);
    }
}
