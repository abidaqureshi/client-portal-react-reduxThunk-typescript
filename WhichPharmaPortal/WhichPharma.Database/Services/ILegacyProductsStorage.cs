using MongoDB.Bson;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Database.Filters;
using WhichPharma.Models.Database.Products;

namespace WhichPharma.Database.Services
{
    public interface ILegacyProductsStorage
    {
        Task<(List<LegacyProduct> Items, long Total)> GetProductsAsync(LegacyProductsFilter filter, int offset, int pageSize, CancellationToken token = default);
        Task<(List<LegacyProduct> Items, long Total)> GetProductsAsync(LegacyProductsFilter filter, LegacyProductsFilter negatedFilter, int offset, int pageSize, CancellationToken token = default);
        Task<List<LegacyProduct>> GetProductsByIdAsync(IEnumerable<ObjectId> ids, CancellationToken token = default);
        Task<List<string>> GetAllCountries(CancellationToken token);
        Task<List<string>> GetAllOrigins(CancellationToken token);
        Task<List<string>> GetAllActiveSubstances(CancellationToken token);
        Task<List<string>> GetAllATCs(CancellationToken token);
        Task<List<string>> GetAllDrugForms(CancellationToken token);
        Task<List<string>> GetAllAdministrationForms(CancellationToken token);
        Task<List<LegacyProductStatus>> GetAllStatuses(CancellationToken token);
    }
}
