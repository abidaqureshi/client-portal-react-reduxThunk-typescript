using System.Threading;
using System.Threading.Tasks;
using WhichPharmaPortal.Models.Client;

namespace WhichPharma.Services.Products
{
    public interface ILegacyProductSets
    {
        Task<Country[]> GetCountriesAsync(CancellationToken token);
        Task<string[]> GetOriginsAsync(CancellationToken token);
        Task<string[]> GetActiveSubstancesAsync(CancellationToken token);
        Task<string[]> GetATCsAsync(CancellationToken token);
        Task<string[]> GetDrugFormsSet(CancellationToken token);
        Task<string[]> GetAdministrationFormsSet(CancellationToken token);
        Task<string[]> GetStatusesAsync(CancellationToken token);
    }
}
