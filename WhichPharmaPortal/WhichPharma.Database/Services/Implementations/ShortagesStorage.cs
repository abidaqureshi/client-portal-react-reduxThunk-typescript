using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Database.Config;
using WhichPharma.Database.Filters;
using WhichPharma.Database.Utils;
using WhichPharma.Models.Database.Products;

namespace WhichPharma.Database.Services.Implementations
{
    public class ShortagesStorage : IShortagesStorage
    {
        private const string _collectionName = "shortages";
        private readonly IMongoCollection<Shortage> _collection;

        public ShortagesStorage(IStorageConfig<ShortagesStorage> config)
        {
            _collection = new MongoClient(config.ConnectionString).GetDatabase(config.DatabaseName).GetCollection<Shortage>(_collectionName);
        }

        public async Task<(List<Shortage> Items, long Total)> GetShortagesAsync(ShortagesFilter filter, int offset, int pageSize, CancellationToken token = default)
        {
            var endFilter = filter.EndFrom.HasValue
                ? Builders<Shortage>.Filter.Gte(s => s.End, filter.EndFrom.Value) | Builders<Shortage>.Filter.Exists(s => s.End, false)
                : null;

            var filters = new DynamicFilterBuilder<Shortage>()
                .EqualIfNotNull(p => p.Country, filter.Countries)
                .EqualIfNotNull(p => p.Type, filter.Types)
                .EqualIfNotNull(p => p.ScrapingOrigin, filter.Origins)
                .GreaterOrEqualThanIfNotNull(p => p.Start, filter.StartFrom?.Date)
                .LessOrEqualThanIfNotNull(p => p.Start, filter.StartTo?.Date.AddDays(1))
                .LessOrEqualThanIfNotNull(p => p.End, filter.EndTo?.Date.AddDays(1))
                .CustomIfNotNull(endFilter)
                .Build();

            var totalTask = _collection
                .Find(filters)
                .CountDocumentsAsync(token);

            var items = await _collection
                .Find(filters)
                .Skip(offset)
                .Limit(pageSize)
                .ToListAsync(token);


            return (Items: items, Total: await totalTask);
        }
    }
}
