using System.Threading;
using System.Threading.Tasks;
using WhichPharmaPortal.Models.Client;
using WhichPharma.Models.Server;

namespace WhichPharma.Services.Shortages
{
    public interface IShortagesService
    {
        Task<SearchResult<Shortage>> GetShortagesAsync(GetShortagesFilters filters, int offset, int pageSize, CancellationToken token = default);
    }
}
