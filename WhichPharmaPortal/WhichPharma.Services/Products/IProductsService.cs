using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WhichPharmaPortal.Models.Client;
using WhichPharma.Models.Server;

namespace WhichPharma.Services.Products
{
    public interface IProductsService
    {
        Task<SearchResult<ProductV2>> GetProductsAsync(GetProductsFilters filters, int offset, int pageSize, bool isCollectionDev = false, CancellationToken token = default);
        Task<SearchResult<ProductV2>> GetProductsAsync(GetProductsFilters filters, GetProductsFilters negatedFilters, int offset, int pageSize, bool isCollectionDev = false, CancellationToken token = default);
        Task<IEnumerable<Shortage>> FillShortagesProductInfo(IEnumerable<Shortage> shortages, CancellationToken token = default);
        Task<ProductV2> GetProductAsync(string countryCode, string productCode, CancellationToken token);
    }
}
