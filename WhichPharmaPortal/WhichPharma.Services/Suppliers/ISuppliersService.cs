using System.Collections;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WhichPharmaPortal.Models.Client;
using WhichPharma.Models.Server;

namespace WhichPharma.Services.Suppliers
{
    public interface ISuppliersService
    {
        Task<Supplier> GetSupplierAsync(string supplierId, CancellationToken token = default);
        Task<Supplier> GetSupplierForEmailAsync(string email, CancellationToken token = default);
        Task<SearchResult<Supplier>> GetSuppliersAsync(GetSuppliersFilters filters, int offset, int pageSize, CancellationToken token = default);
    }
}
