using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Database.Config;
using WhichPharma.Models.Database.Products;
using WhichPharma.Models.Worker;

namespace WhichPharma.Database.Services.Implementations
{
    public class ScrapperStorage : IScrapperStorage
    {
        private readonly IMongoDatabase _mongoDatabaseDev;
        private readonly IMongoDatabase _mongoDatabase;
        private readonly MongoClient _mongoClient;
        private readonly IStorageConfig<ScrapperStorage> _config;
        private readonly string _collectionLogExecutionScrapper = "log-execution-scrappers";
        private readonly string _collectionLogExecutionScrapperProducts = "log-execution-scrappers-products";

        public ScrapperStorage(IStorageConfig<ScrapperStorage> config)
        {
            _mongoClient = new MongoClient(config.ConnectionString);
            _mongoDatabaseDev = _mongoClient.GetDatabase("rbpharma-dev");
            _mongoDatabase = _mongoClient.GetDatabase("rbpharma");
            _config = config;
        }

        public Task<LogExecutionScrapper> GetLogExeuctionScrapperAsync(string executionId, CancellationToken token = default)
        {
            IMongoCollection<LogExecutionScrapper> _collection = _mongoDatabaseDev.GetCollection<LogExecutionScrapper>(_collectionLogExecutionScrapper);
            IMongoCollection<LogExecutionScrapper> _collectionDep = _mongoDatabase.GetCollection<LogExecutionScrapper>(_collectionLogExecutionScrapper);
            return 
                _collection.Find(x => x.ExecutionId == executionId && x.IsSuccess && x.IsVerified == false).CountDocuments()!=0?
                _collection.Find(x => x.ExecutionId == executionId && x.IsSuccess && x.IsVerified == false).FirstOrDefaultAsync():
                _collectionDep.Find(x => x.ExecutionId == executionId && x.IsSuccess && x.IsVerified == false).FirstOrDefaultAsync();
        }

        public async Task RemoveCollection(string collectionName, CancellationToken token = default)
        {
            if (_mongoDatabaseDev.ListCollectionNames().ToEnumerable().Any(x => x == collectionName))
            {
                await _mongoDatabaseDev.DropCollectionAsync(collectionName);
            }else if (_mongoDatabase.ListCollectionNames().ToEnumerable().Any(x => x == collectionName))
            {
                await _mongoDatabase.DropCollectionAsync(collectionName);
            }
        }

        public Task<List<Product>> GetProductsByCollection(string collectionName, CancellationToken token = default)
        {
            IMongoCollection<Product> _collectionDev = _mongoDatabaseDev.GetCollection<Product>(collectionName);
            IMongoCollection<Product> _collection = _mongoDatabase.GetCollection<Product>(collectionName);
            return _collectionDev.Find(Builders<Product>.Filter.Empty).CountDocuments()!=0? _collectionDev.Find(Builders<Product>.Filter.Empty).ToListAsync(): _collection.Find(Builders<Product>.Filter.Empty).ToListAsync();
        }

        public Task SetVerifiedLogExecution(string logExecutionId)
        {
            IMongoCollection<LogExecutionScrapper> _collection = _mongoDatabaseDev.GetCollection<LogExecutionScrapper>(_collectionLogExecutionScrapper);
            IMongoCollection<LogExecutionScrapper> _collectionDep = _mongoDatabase.GetCollection<LogExecutionScrapper>(_collectionLogExecutionScrapper);
            return _collection.Find(x=>x.ExecutionId==logExecutionId).CountDocuments()!=0?
                _collection.UpdateOneAsync(
                x => x.ExecutionId == logExecutionId,
                Builders<LogExecutionScrapper>.Update.Set(l => l.IsVerified, true),
                new UpdateOptions()
                ):
                _collectionDep.UpdateOneAsync(
                x => x.ExecutionId == logExecutionId,
                Builders<LogExecutionScrapper>.Update.Set(l => l.IsVerified, true),
                new UpdateOptions()
                );
        }

        public Task<List<LogExecutionScrapperProduct>> GetProductsAlteredByExecutionId(string executionId, CancellationToken token = default)
        {
            IMongoCollection<LogExecutionScrapperProduct> _collectionDev = _mongoDatabaseDev.GetCollection<LogExecutionScrapperProduct>(_collectionLogExecutionScrapperProducts);
            IMongoCollection<LogExecutionScrapperProduct> _collection = _mongoDatabase.GetCollection<LogExecutionScrapperProduct>(_collectionLogExecutionScrapperProducts);
            var list = _collectionDev.Find(x => x.ExecutionId == executionId);
            var list2 = _collection.Find(x => x.ExecutionId == executionId);
            return list.CountDocuments()!=0 ? list.ToListAsync() : list2.ToListAsync();
        }

        public Task<LogExecutionScrapperProduct> GetProductAlteredByExecutionId(string executionId, string scrapingOriginIdentifier, CancellationToken token = default)
        {
            IMongoCollection<LogExecutionScrapperProduct> _collection = _mongoDatabaseDev.GetCollection<LogExecutionScrapperProduct>(_collectionLogExecutionScrapperProducts);
            IMongoCollection<LogExecutionScrapperProduct> _collectionDep = _mongoDatabase.GetCollection<LogExecutionScrapperProduct>(_collectionLogExecutionScrapperProducts);
            return _collection.Find(x => x.ExecutionId == executionId && 
                                         x.ProductIdentifier == scrapingOriginIdentifier).CountDocuments()!=0? 
                                         _collection.Find(x => x.ExecutionId == executionId &&
                                          x.ProductIdentifier == scrapingOriginIdentifier).FirstOrDefaultAsync(token): 
                                          _collectionDep.Find(x => x.ExecutionId == executionId &&
                                          x.ProductIdentifier == scrapingOriginIdentifier).FirstOrDefaultAsync(token);
        }

        public async Task<List<string>> GetEmailsToSend(CancellationToken token)
        {
            IMongoCollection<WorkerConfig> _collection = _mongoClient.GetDatabase(_config.DatabaseName).GetCollection<WorkerConfig>("worker-config");
            return (await _collection.Find(Builders<WorkerConfig>.Filter.Empty)
                        .FirstOrDefaultAsync(token))?.EmailsToSend.ToList() ?? new List<string>();

        }
    }

    [BsonIgnoreExtraElements]
    public class WorkerConfig
    {
        public string[] EmailsToSend { get; set; }
    }
}
