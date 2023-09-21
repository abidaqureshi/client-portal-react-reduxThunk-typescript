using MongoDB.Bson;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Database.Filters;
using WhichPharma.Models.Database.Products;

namespace WhichPharma.Database.Services
{
    public interface IProductsStorage
    {
        Task<(List<Product> Items, long Total)> GetProductsAsync(ProductsFilter filter, int offset, int pageSize, bool isCollectionDev = false, CancellationToken token = default);
        Task<(List<Product> Items, long Total)> GetProductsAsync(ProductsFilter filter, ProductsFilter negatedFilter, int offset, int pageSize, bool isCollectionDev = false, CancellationToken token = default);
        Task<List<Product>> GetProductsByIdAsync(IEnumerable<ObjectId> ids, CancellationToken token = default);
        Task<List<string>> GetAllCountries(CancellationToken token);
        Task<List<string>> GetAllOrigins(CancellationToken token);
        Task<List<string>> GetAllActiveSubstances(CancellationToken token);
        Task<List<string>> GetAllATCs(CancellationToken token);
        Task<List<string>> GetAllPharmaceuticalForms(CancellationToken token);
        Task<List<string>> GetAllAdministrations(CancellationToken token);
        Task<Product> GetProductAsync(string countryCode, string productCode, CancellationToken token);
        Task UpdateProductAsync(string executionId, Product product, bool isCollectionDev = false, CancellationToken token = default);
    }
}
