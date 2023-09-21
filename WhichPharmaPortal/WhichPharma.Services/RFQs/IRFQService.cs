using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WhichPharmaPortal.Models.Client;

namespace WhichPharma.Services.RFQs
{
    public interface IRFQService
    {
        Task<CreateRFQResult> CreateRFQsAsync(string requesterUsername, RFQRequest request, CancellationToken token);
        Task<IEnumerable<RFQSummary>> GetRFQSummariesAsync(IEnumerable<string> rfqsNrs, CancellationToken token);
        Task<(IEnumerable<RFQSummary> Result, long Total)> GetRFQSummariesAsync(string assignedTo, string search, int offset, int pageSize, CancellationToken token);
        Task<IEnumerable<RFQDetails>> GetSupplierRFQsDetailsAsync(string supplierId, string supplierEmail, CancellationToken token);
        Task<RFQDetails> GetRFQDetailsAsync(string rfqNumber, string sortBy, string sortType, CancellationToken token);
        Task<IEnumerable<RFQDetails>> GetRFQsDetailsAsync(IEnumerable<string> rfqNumbers, CancellationToken token);
        Task<RFQUpdateError> ChangeAssigneeAsync(string rfqNumber, string username, CancellationToken token);
        Task<RFQUpdateError> ChangeRFQTableDataAsync(
            string username,
            string rfqNumber,
            IDictionary<string, IEnumerable<RFQQuote>> dataByThreadId,
            CancellationToken token);
        Task<RFQUpdateError> UpdateRFQSupplierTableDataAsync(
            string rfqNumber,
            string supplierId,
            string supplierEmail,
            IEnumerable<RFQQuote> data,
            string dueDate,
            bool sendEmailConfirmingChange,
           // string attachedFile,
            CancellationToken token);
        Task<string> GetNextRFQNumberAsync(CancellationToken token);
        Task<bool> SendExternalAccessLinkEmailAsync(string contactEmail, CancellationToken token);
        Task<RFQDetails> GetRFQDetailsHistoryAsync(string rfqNumbers, CancellationToken token);
        Task<bool> UpdateRfqCard(string rfqNUmber ,List<RFQCards> rfqCards);
        Task ChangeRFQDate(string rfqNumber, ChangeRFQDueDate rFQ, CancellationToken token);
        Task ChangeRFQState(string rfqNumber, ChangeRFQState rFQ, CancellationToken token);
    }
}
