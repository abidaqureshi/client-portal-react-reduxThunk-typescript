using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Models.Database.Products;
using WhichPharma.Models.Worker;

namespace WhichPharma.Services.Scrappers
{
    public interface IScrapperService
    {
        Task<LogExecutionScrapper> GetLogExecutionScrapper(string executionId, CancellationToken token = default);
        Task ApprovedOrDeclinedExecutionScrapper(string executionId, bool approved, CancellationToken token = default);
        Task<List<LogExecutionScrapperProduct>> GetProductsAlteredByExecutionId(string executionId, CancellationToken token = default);
        Task<List<Product>> GetProductsByCollection(string collectionName, CancellationToken token = default);
    }
}
