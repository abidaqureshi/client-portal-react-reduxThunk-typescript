using Microsoft.Extensions.Caching.Memory;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Database.Services;
using WhichPharmaPortal.Models.Client;
using WhichPharma.Utils;
using WhichPharma.Utils.Extensions;

namespace WhichPharma.Services.Products
{
    public class LegacyProductsSets : ILegacyProductSets
    {
        private const int _countriesCacheHours = 48;
        private const int _originsCacheHours = 48;
        private const int _innsCacheHours = 1;
        private const int _atcsCacheHours = 1;
        private const int _drugFormCacheHours = 1;
        private const int _administrationFormCacheHours = 1;
        private const int _statusesCacheHours = 48;

        private IMemoryCache _cache;
        private readonly ILegacyProductsStorage _productsStorage;

        public LegacyProductsSets(IMemoryCache cache, ILegacyProductsStorage productsStorage)
        {
            _cache = cache;
            _productsStorage = productsStorage;
        }

        public Task<Country[]> GetCountriesAsync(CancellationToken token) 
        {
            return _cache.GetOrCreateAsync(
                "products-countries-legacy", 
                entry =>
                {
                    entry.SlidingExpiration = TimeSpan.FromHours(_countriesCacheHours);

                    return _productsStorage
                        .GetAllCountries(token)
                        .Select(result => result.Where(v => v != null).Select(country => new Country
                        {            
                            Name = CountryList.GetName(country),
                            Alpha2Code = country,
                        }).ToArray());
                });
        }

        public Task<string[]> GetOriginsAsync(CancellationToken token)
        {
            return _cache.GetOrCreateAsync(
                "products-origins-legacy",
                entry =>
                {
                    entry.SlidingExpiration = TimeSpan.FromHours(_originsCacheHours);
                    return _productsStorage.GetAllOrigins(token).Select(result => result.Where(v => v != null).ToArray());
                });
        }

        public Task<string[]> GetActiveSubstancesAsync(CancellationToken token)
        {
            return _cache.GetOrCreateAsync(
                "products-inns-legacy",
                entry =>
                {
                    entry.SlidingExpiration = TimeSpan.FromHours(_innsCacheHours);
                    return _productsStorage.GetAllActiveSubstances(token).Select(result => result.Where(v => v != null).ToArray());
                });
        }

        public Task<string[]> GetATCsAsync(CancellationToken token)
        {
            return _cache.GetOrCreateAsync(
                "products-atcs-legacy",
                entry =>
                {
                    entry.SlidingExpiration = TimeSpan.FromHours(_atcsCacheHours);
                    return _productsStorage.GetAllATCs(token).Select(result => result.Where(v => v != null).ToArray());
                });
        }

        public Task<string[]> GetDrugFormsSet(CancellationToken token)
        {
            return _cache.GetOrCreateAsync(
                "products-drugforms-legacy",
                entry =>
                {
                    entry.SlidingExpiration = TimeSpan.FromHours(_drugFormCacheHours);
                    return _productsStorage.GetAllDrugForms(token).Select(result => result.Where(v => v != null).ToArray());
                });
        }

        public Task<string[]> GetAdministrationFormsSet(CancellationToken token)
        {
            return _cache.GetOrCreateAsync(
                "products-administrationforms-legacy",
                entry =>
                {
                    entry.SlidingExpiration = TimeSpan.FromHours(_administrationFormCacheHours);
                    return _productsStorage.GetAllAdministrationForms(token).Select(result => result.Where(v => v != null).ToArray());
                });
        }

        public Task<string[]> GetStatusesAsync(CancellationToken token)
        {
            return _cache.GetOrCreateAsync(
                "products-statuses-legacy",
                entry =>
                {
                    entry.SlidingExpiration = TimeSpan.FromHours(_statusesCacheHours);

                    return _productsStorage
                        .GetAllStatuses(token)
                        .Select(result => result.Select(state => state.ToString()).Where(v => v != null).ToArray());
                });
        }
    }
}
