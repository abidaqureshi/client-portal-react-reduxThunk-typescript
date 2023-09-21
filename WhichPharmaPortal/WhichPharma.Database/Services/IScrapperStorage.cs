using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Models.Database.Products;
using WhichPharma.Models.Worker;

namespace WhichPharma.Database.Services
{
    public interface IScrapperStorage
    {
        Task<LogExecutionScrapper> GetLogExeuctionScrapperAsync(string executionId, CancellationToken token = default);
        Task RemoveCollection(string collectionName, CancellationToken token = default);
        Task<List<Product>> GetProductsByCollection(string collectionName, CancellationToken token = default);
        Task SetVerifiedLogExecution(string logExecutionId);
        Task<List<LogExecutionScrapperProduct>> GetProductsAlteredByExecutionId(string executionId, CancellationToken token = default);
        Task<LogExecutionScrapperProduct> GetProductAlteredByExecutionId(string executionId, string ScrapingOriginIdentifier, CancellationToken token = default);
        Task<List<string>> GetEmailsToSend(CancellationToken token);
    }
}
