using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WhichPharmaPortal.Models.Client;
using WhichPharma.Models.Server;

namespace WhichPharma.Services.Products
{
    public interface ILegacyProductsService
    {
        Task<SearchResult<ProductV1>> GetProductsAsync(GetLegacyProductsFilters filters, int offset, int pageSize, CancellationToken token = default);
        Task<SearchResult<ProductV1>> GetProductsAsync(GetLegacyProductsFilters filters, GetLegacyProductsFilters negatedFilters, int offset, int pageSize, CancellationToken token = default);
        Task<IEnumerable<Shortage>> FillShortagesProductInfo(IEnumerable<Shortage> shortages, CancellationToken token = default);
    }
}
