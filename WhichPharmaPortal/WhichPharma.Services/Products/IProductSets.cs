using System.Threading;
using System.Threading.Tasks;
using WhichPharmaPortal.Models.Client;

namespace WhichPharma.Services.Products
{
    public interface IProductSets
    {
        Task<Country[]> GetCountriesAsync(CancellationToken token);
        Task<string[]> GetOriginsAsync(CancellationToken token);
        Task<string[]> GetActiveSubstancesAsync(CancellationToken token);
        Task<string[]> GetATCsAsync(CancellationToken token);
        Task<string[]> GetAdministrationCategoriesAsync(CancellationToken token);
        Task<string[]> GetPharmaceuticalFormCategoriesAsync(CancellationToken token);
    }
}
