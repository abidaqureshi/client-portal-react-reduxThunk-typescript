using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Database.Config;
using WhichPharma.Database.Filters;
using WhichPharma.Database.Utils;
using WhichPharma.Models.Database.Suppliers;

namespace WhichPharma.Database.Services.Implementations
{
    public class SuppliersStorage : ISuppliersStorage
    {
        private const string _collectionName = "suppliers";
        private readonly IMongoCollection<Supplier> _collection;

        public SuppliersStorage(IStorageConfig<SuppliersStorage> config)
        {
            _collection = new MongoClient(config.ConnectionString).GetDatabase(config.DatabaseName).GetCollection<Supplier>(_collectionName);
        }

        public async Task<(List<Supplier> Items, long Total)> GetSuppliersAsync(
            SuppliersFilter filter, 
            int offset,
            int pageSize,
            CancellationToken token = default)
        {
            var filters = new DynamicFilterBuilder<Supplier>()
                .ContainsIfNotNull(p => p.Name, filter.NameContains)
                .EqualIfNotNull(p => p.Country, filter.Countries)
                .EqualIf(p => p.State, filter.Statuses, filter.Statuses?.Any() ?? false)
                .Build();

            var totalTask = _collection
                .Find(filters)
                .CountDocumentsAsync(token);

            var find = _collection
                    .Find(filters)
                    .Skip(offset)
                    .Limit(pageSize);

            return (
                Items: await find.ToListAsync(token),
                Total: await totalTask);
        }

        public Task<List<Supplier>> GetSuppliersByIdAsync(IEnumerable<ObjectId> ids, CancellationToken token)
        {
            return _collection.Find(s => ids.Contains(s.Id)).ToListAsync(token);
        }

        public Task<Supplier> GetSupplierByIdAsync(ObjectId id, CancellationToken token)
        {
            return _collection.Find(s => id == s.Id).SingleOrDefaultAsync(token);
        }

        public Task<Supplier> GetSupplierByEmailAsync(string email, CancellationToken token)
        {
            return _collection.Find(s => s.Contacts.Any(c => c.Emails.Contains(email))).SingleOrDefaultAsync(token);
        }
    }
}
