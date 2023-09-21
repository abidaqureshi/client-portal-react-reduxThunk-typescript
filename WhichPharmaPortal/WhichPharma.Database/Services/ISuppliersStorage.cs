using MongoDB.Bson;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Database.Filters;
using WhichPharma.Models.Database.Suppliers;

namespace WhichPharma.Database.Services
{
    public interface ISuppliersStorage
    {
        Task<(List<Supplier> Items, long Total)> GetSuppliersAsync(SuppliersFilter filter, int offset, int pageSize, CancellationToken token = default);
        Task<List<Supplier>> GetSuppliersByIdAsync(IEnumerable<ObjectId> ids, CancellationToken token);
        Task<Supplier> GetSupplierByIdAsync(ObjectId id, CancellationToken token);
        Task<Supplier> GetSupplierByEmailAsync(string email, CancellationToken token);
    }
}
