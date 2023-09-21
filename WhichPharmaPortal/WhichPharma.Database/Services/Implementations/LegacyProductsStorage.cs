using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Database.Config;
using WhichPharma.Database.Filters;
using WhichPharma.Database.Utils;
using WhichPharma.Models.Database.Products;
using WhichPharma.Utils.Exceptions;

namespace WhichPharma.Database.Services.Implementations
{
    public class LegacyProductsStorage : ILegacyProductsStorage
    {
        private const string _collectionName = "products";
        private readonly IMongoCollection<LegacyProduct> _collection;

        public LegacyProductsStorage(IStorageConfig<LegacyProductsStorage> config)
        {
            _collection = new MongoClient(config.ConnectionString).GetDatabase(config.DatabaseName).GetCollection<LegacyProduct>(_collectionName);
        }

        private static PropertyInfo GetSortByProperty(string sortBy)
        {
            if (string.IsNullOrWhiteSpace(sortBy)) return null;

            sortBy = sortBy.ToLowerInvariant();

            var sortByProperty = typeof(LegacyProduct)
                .GetProperties()
                .FirstOrDefault(p => p.Name.ToLowerInvariant() == sortBy);

            if (sortByProperty is null)
            {
                throw new InvalidParameterException($"Invalid value: \"{sortBy}\"", nameof(LegacyProductsFilter.SortBy));
            }

            return sortByProperty;
        }

        public Task<(List<LegacyProduct> Items, long Total)> GetProductsAsync(LegacyProductsFilter filter, int offset, int pageSize, CancellationToken token = default)
        {
            return GetProductsAsync(filter, null, offset, pageSize, token);
        }

        public async Task<(List<LegacyProduct> Items, long Total)> GetProductsAsync(LegacyProductsFilter filter, LegacyProductsFilter negatedFilter, int offset, int pageSize, CancellationToken token = default)
        {
            var sortByProperty = GetSortByProperty(filter.SortBy);

            var freeTextFilter = filter.AnyContains is null ? null : Builders<LegacyProduct>.Filter.Text(filter.AnyContains, new TextSearchOptions
            {
                CaseSensitive = false,
                DiacriticSensitive = false,
            });

            var atcsFilterFilter = filter.ATCContains?
                .Aggregate(new DynamicFilterBuilder<LegacyProduct>(), (builder, value) => builder.Contains(p => p.ATC, value))
                .Build(false);
           
            var productCodeOrMANumberFilter = filter.ProductCodeOrMANumberContains is null ? null : new DynamicFilterBuilder<LegacyProduct>()
                .Contains(p => p.ProductCode, filter.ProductCodeOrMANumberContains)
                .Contains(p => p.MANumber, filter.ProductCodeOrMANumberContains)
                .Contains(p => p.ScrapingOriginId, filter.ProductCodeOrMANumberContains)
                .Build(false);

            var manufacturerOrMAHolderFilter = filter.ManufacturerOrMAHolderContains is null ? null : new DynamicFilterBuilder<LegacyProduct>()
                .Contains(p => p.Manufacturer, filter.ManufacturerOrMAHolderContains)
                .Contains(p => p.MAHolder, filter.ManufacturerOrMAHolderContains)
                .Build(false);

            
            var hideExprice = filter.Origins?.Any() ?? false || filter.IncludeExprice
                ? null
                : Builders<LegacyProduct>.Filter.Or( // Hardcoded hide exprice results for Countries where we already have our own scrapper, TODO: put it on appsettings
                    Builders<LegacyProduct>.Filter.Nin(p => p.Country, new string[] { "AT", "CN", "HR", "CZ", "FR", "IT", "LV", "RO", "SI", "ES", "CH", "IL", "GR", "NL", "IE", "NO", "DK", "HU", "LT", "SE"}),
                    Builders<LegacyProduct>.Filter.Ne(p => p.ScrapingOrigin, "exprice"));

            var filtersBuilder = new DynamicFilterBuilder<LegacyProduct>()
                .ContainsIfNotNull(p => p.Name, filter.NameContains)
                .CustomIfNotNull(productCodeOrMANumberFilter)
                .CustomIfNotNull(manufacturerOrMAHolderFilter)
                .CustomIfNotNull(atcsFilterFilter)
                .CustomIfNotNull(freeTextFilter)
                .CustomIfNotNull(hideExprice)
                .ContainsAllIfNotNull(p => p.ActiveSubstances, filter.ActiveSubstances)
                .EqualIfNotNull(p => p.Country, filter.Countries)
                .EqualIfNotNull(p => p.DrugForm, filter.DrugForms)
                .EqualIfNotNull(p => p.AdministrationForm, filter.AdministrationForms)
                .EqualIfNotNull(p => p.Status, filter.Statuses)
                .EqualIfNotNull(p => p.ScrapingOrigin, filter.Origins)
                //.GreaterThan(p => p.LastUpdate, DateTime.UtcNow.AddDays(-12))
                .NotEqual(p => p.IsDeleted, true);

            if(negatedFilter != null)
            {
                filtersBuilder = filtersBuilder
                    .NotContainsIfNotNull(p => p.Name, negatedFilter.NameContains)
                    //.NotCustomIfNotNull(productCodeOrMANumberFilter)
                    //.NotCustomIfNotNull(manufacturerOrMAHolderFilter)
                    //.NotCustomIfNotNull(atcsFilterFilter)
                    //.NotCustomIfNotNull(freeTextFilter)
                    .NotContainsAllIfNotNull(p => p.ActiveSubstances, negatedFilter.ActiveSubstances)
                    .NotEqualIfNotNull(p => p.Country, negatedFilter.Countries)
                    .NotEqualIfNotNull(p => p.DrugForm, negatedFilter.DrugForms)
                    .NotEqualIfNotNull(p => p.AdministrationForm, negatedFilter.AdministrationForms)
                    .NotEqualIfNotNull(p => p.Status, negatedFilter.Statuses)
                    .NotEqualIfNotNull(p => p.ScrapingOrigin, negatedFilter.Origins);
            }

            var filters = filtersBuilder.Build();

            var totalTask = _collection
                .Find(filters)
                .CountDocumentsAsync(token);

            var find = _collection
                    .Find(filters)
                    .Skip(offset)
                    .Limit(pageSize);

            if (sortByProperty != null)
            {
                var sort = filter.SortDescending
                    ? Builders<LegacyProduct>.Sort.Descending(sortByProperty.Name)
                    : Builders<LegacyProduct>.Sort.Ascending(sortByProperty.Name);

                find = find.Sort(sort);
            }

            return (
                Items: await find.ToListAsync(token), 
                Total: await totalTask);
        }
        
        public Task<List<LegacyProduct>> GetProductsByIdAsync(IEnumerable<ObjectId> ids, CancellationToken token = default) =>
            _collection.Find(Builders<LegacyProduct>.Filter.In(p => p.Id, ids)).ToListAsync(token);
        public Task<List<string>> GetAllCountries(CancellationToken token) =>
            _collection.Distinct(p => p.Country, Builders<LegacyProduct>.Filter.Empty).ToListAsync(token);
        public Task<List<string>> GetAllOrigins(CancellationToken token) =>
            _collection.Distinct(p => p.ScrapingOrigin, Builders<LegacyProduct>.Filter.Empty).ToListAsync(token);
        public Task<List<string>> GetAllActiveSubstances(CancellationToken token) =>
            _collection.Distinct<string>(nameof(LegacyProduct.ActiveSubstances), Builders<LegacyProduct>.Filter.Empty).ToListAsync(token);
        public Task<List<string>> GetAllATCs(CancellationToken token) =>
            _collection.Distinct(p => p.ATC, Builders<LegacyProduct>.Filter.Empty).ToListAsync(token);
        public Task<List<string>> GetAllDrugForms(CancellationToken token) =>
            _collection.Distinct(p => p.DrugForm, Builders<LegacyProduct>.Filter.Empty).ToListAsync(token);
        public Task<List<string>> GetAllAdministrationForms(CancellationToken token) =>
            _collection.Distinct(p => p.AdministrationForm, Builders<LegacyProduct>.Filter.Empty).ToListAsync(token);
        public Task<List<LegacyProductStatus>> GetAllStatuses(CancellationToken token) =>
            _collection.Distinct(p => p.Status, Builders<LegacyProduct>.Filter.Empty).ToListAsync(token);
    }
}
