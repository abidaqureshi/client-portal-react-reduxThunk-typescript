using Mapster;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Database.Filters;
using WhichPharma.Database.Services;
using WhichPharmaPortal.Models.Client;
using WhichPharma.Models.Server;
using WhichPharma.Utils.Extensions;
using WhichPharma.Utils;
using DbContact = WhichPharma.Models.Database.Suppliers.Contact;
using DbSupplier = WhichPharma.Models.Database.Suppliers.Supplier;
using DbSupplierStatus = WhichPharma.Models.Database.Suppliers.SupplierState;

namespace WhichPharma.Services.Suppliers
{
    public class SuppliersService : ISuppliersService
    {
        private readonly ISuppliersStorage _suppliersStorage;

        static SuppliersService()
        {
            TypeAdapterConfig.GlobalSettings.NewConfig<DbContact, Contact>()
                .IgnoreNullValues(true)
                .Map(dest => dest.Email, src => src.Emails == null ? null : string.Join(", ", src.Emails))
                .Map(dest => dest.Name, src => string.Join(" ", new string[] { src.FirstName, src.LastName }.Where(s => !string.IsNullOrEmpty(s))))
                .Compile();

            TypeAdapterConfig.GlobalSettings.NewConfig<DbSupplier, Supplier>()
                .IgnoreNullValues(true)
                .Map(dest => dest.Country, src => CountryList.GetName(src.Country))
                .Map(dest => dest.CountryCode, src => src.Country)
                .Compile();
        }

        public SuppliersService(ISuppliersStorage suppliersStorage)
        {
            _suppliersStorage = suppliersStorage;
        }

        public async Task<Supplier> GetSupplierAsync(string supplierId, CancellationToken token = default)
        {
            return (await _suppliersStorage.GetSupplierByIdAsync(new MongoDB.Bson.ObjectId(supplierId), token)).Adapt<Supplier>();
        }

        public async Task<Supplier> GetSupplierForEmailAsync(string email, CancellationToken token = default)
        {
            return (await _suppliersStorage.GetSupplierByEmailAsync(email, token)).Adapt<Supplier>();
        }

        public Task<SearchResult<Supplier>> GetSuppliersAsync(GetSuppliersFilters filters, int offset, int pageSize, CancellationToken token = default)
        {
            var dbFilter = new SuppliersFilter
            {
                NameContains = filters.Name,
                Countries = filters.Countries?.Split(new char[] { ',' }).Select(s => s.Trim()),
                Statuses = filters.Statuses?.Split(new char[] { ',' })
                        .Select(s => s.Trim().Adapt<DbSupplierStatus>()),
            };

            return _suppliersStorage.GetSuppliersAsync(dbFilter, offset, pageSize, token)
                .Select(result => new SearchResult<Supplier>
                {
                    Total = (int)result.Total,
                    Items = result.Items.Select(product => product.Adapt<Supplier>()).ToList()
                });
        }
    }
}
