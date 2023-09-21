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
    public class ProductsSets : IProductSets
    {
        private const int _countriesCacheHours = 48;
        private const int _originsCacheHours = 48;
        private const int _innsCacheHours = 1;
        private const int _atcsCacheHours = 1;
        private const int _statusesCacheHours = 48;

        private IMemoryCache _cache;
        private readonly IProductsStorage _productsStorage;

        public ProductsSets(IMemoryCache cache, IProductsStorage productsStorage)
        {
            _cache = cache;
            _productsStorage = productsStorage;
        }

        public Task<Country[]> GetCountriesAsync(CancellationToken token) 
        {
            return _cache.GetOrCreateAsync(
                "products-countries", 
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
                "products-origins",
                entry =>
                {
                    entry.SlidingExpiration = TimeSpan.FromHours(_originsCacheHours);
                    return _productsStorage.GetAllOrigins(token).Select(result => result.Where(v => v != null).ToArray());
                });
        }

        public Task<string[]> GetActiveSubstancesAsync(CancellationToken token)
        {
            return _cache.GetOrCreateAsync(
                "products-inns",
                entry =>
                {
                    entry.SlidingExpiration = TimeSpan.FromHours(_innsCacheHours);
                    return _productsStorage.GetAllActiveSubstances(token).Select(result => result.Where(v => v != null).ToArray());
                });
        }

        public Task<string[]> GetATCsAsync(CancellationToken token)
        {
            return _cache.GetOrCreateAsync(
                "products-atcs",
                entry =>
                {
                    entry.SlidingExpiration = TimeSpan.FromHours(_atcsCacheHours);
                    return _productsStorage.GetAllATCs(token).Select(result => result.Where(v => v != null).ToArray());
                });
        }

        public Task<string[]> GetAdministrationCategoriesAsync(CancellationToken token)
        {
            return _cache.GetOrCreateAsync(
                "products-administration-form-categories",
                entry =>
                {
                    entry.SlidingExpiration = TimeSpan.FromHours(_statusesCacheHours);
                    return _productsStorage.GetAllAdministrations(token).Select(result => result.Where(v => v != null).ToArray());
                });
        }

        public Task<string[]> GetPharmaceuticalFormCategoriesAsync(CancellationToken token)
        {
            return _cache.GetOrCreateAsync(
                "products-drug-form-categories",
                entry =>
                {
                    entry.SlidingExpiration = TimeSpan.FromHours(_statusesCacheHours);
                    return _productsStorage.GetAllPharmaceuticalForms(token).Select(result => result.Where(v => v != null).ToArray());
                });
        }
    }
}
