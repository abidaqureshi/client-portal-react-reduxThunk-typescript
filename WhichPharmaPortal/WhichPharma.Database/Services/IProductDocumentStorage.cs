using MongoDB.Bson;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Database.Filters;
using WhichPharma.Models.Database.Products;

namespace WhichPharma.Database.Services
{
    public interface IProductDocumentStorage
    {
        Task<Implementations.ProductDocumentDB> FindDocumentByProductDocumetTypeCountryAsync(string productId, string documentType, string country, CancellationToken token);
    }
}
