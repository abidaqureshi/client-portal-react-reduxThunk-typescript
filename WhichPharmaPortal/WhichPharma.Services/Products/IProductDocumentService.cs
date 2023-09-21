using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WhichPharmaPortal.Models.Client;
using WhichPharma.Models.Server;
using System.IO;

namespace WhichPharma.Services.Products
{
    public interface IProductDocumentService
    {
        Task<MemoryStream> GetProductDocumentAsync(string productCode, string documentType, string country, CancellationToken token = default);
    }
}
