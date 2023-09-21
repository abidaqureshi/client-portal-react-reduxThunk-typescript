using MongoDB.Driver;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Database.Config;
using WhichPharma.Models.Database.Platform;

namespace WhichPharma.Database.Services.Implementations
{
    //  This class must be include to library
    public class ProductDocumentDB
    {
        [BsonId]
        public ObjectId Id
        {
            get;
            set;
        }

        public string ProductCode
        {
            get;
            set;
        }

        public string Type
        {
            get;
            set;
        }

        public string Country
        {
            get;
            set;
        }

        public string Document
        {
            get;
            set;
        }
    }

    public class ProductDocumentStorage : IProductDocumentStorage
    {
        private const string _collectionName = "products-documents";
        private readonly IMongoCollection<ProductDocumentDB> _collection;

        public ProductDocumentStorage(IStorageConfig<ProductDocumentStorage> config)
        {
            _collection =  new MongoClient(config.ConnectionString).GetDatabase(config.DatabaseName).GetCollection<ProductDocumentDB>(_collectionName); ;
        }

        public Task<ProductDocumentDB> FindDocumentByProductDocumetTypeCountryAsync(string productCode, string documentType, string country, CancellationToken token)
        {
            return _collection
                .Find(s => s.ProductCode == productCode && s.Type == documentType && s.Country == country)
                .FirstOrDefaultAsync(token);
        }
    }
}
