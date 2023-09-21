using Mapster;
using MongoDB.Bson;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Database.Filters;
using WhichPharma.Database.Services;
using WhichPharmaPortal.Models.Client;
using WhichPharma.Models.Server;
using WhichPharma.Services.Extensions;
using WhichPharma.Utils.Extensions;
using WhichPharma.Utils;
using System;
using System.IO;

namespace WhichPharma.Services.Products
{
    public class ProductDocumentService : IProductDocumentService
    {
        private readonly IProductDocumentStorage _productDocumentStorage;

        public ProductDocumentService(IProductDocumentStorage productDocumentStorage)
        {
            _productDocumentStorage = productDocumentStorage;
        }

        public async Task<MemoryStream> GetProductDocumentAsync(string productId, string documentType, string country, CancellationToken token = default)
        {
            Database.Services.Implementations.ProductDocumentDB productDocument = await _productDocumentStorage.FindDocumentByProductDocumetTypeCountryAsync(productId, documentType, country, token);
            if (productDocument == null || productDocument.Document == null) 
            { 
                return null; 
            }

            byte[] bytesData = System.Convert.FromBase64String(productDocument.Document);

            return new MemoryStream(bytesData);
        }
    }
}
