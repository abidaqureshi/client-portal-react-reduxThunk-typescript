using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Database.Config;
using WhichPharma.Database.Filters;
using WhichPharma.Database.Utils;
using WhichPharma.Models.Database.Products;
using WhichPharma.Models.Products;
using WhichPharma.Utils.Exceptions;

namespace WhichPharma.Database.Services.Implementations
{
    public class ProductsStorage : IProductsStorage
    {
        private const string _collectionName = "products-v2";
        private IMongoCollection<Product> _collection;
        private readonly IScrapperStorage _scrapperStorage;
        private readonly IStorageConfig<ProductsStorage> _config;
        private string[] _ignoredFields = null;
        
        public ProductsStorage(IStorageConfig<ProductsStorage> config, IScrapperStorage scrapperStorage)
        {
            _collection = new MongoClient(config.ConnectionString).GetDatabase(config.DatabaseName).GetCollection<Product>(_collectionName);
            _scrapperStorage = scrapperStorage;
            _config = config;
        }

        private static PropertyInfo GetSortByProperty(string sortBy)
        {
            if (string.IsNullOrWhiteSpace(sortBy)) return null;

            sortBy = sortBy.ToLowerInvariant();

            var sortByProperty = typeof(Product)
                .GetProperties()
                .FirstOrDefault(p => p.Name.ToLowerInvariant() == sortBy);

            if (sortByProperty is null)
            {
                throw new InvalidParameterException($"Invalid value: \"{sortBy}\"", nameof(ProductsFilter.SortBy));
            }

            return sortByProperty;
        }

        public Task<(List<Product> Items, long Total)> GetProductsAsync(ProductsFilter filter, int offset, int pageSize, bool isCollectionDev = false, CancellationToken token = default)
        {
            return GetProductsAsync(filter, null, offset, pageSize, isCollectionDev, token);
        }

        public async Task<(List<Product> Items, long Total)> GetProductsAsync(ProductsFilter filter, ProductsFilter negatedFilter, int offset, int pageSize, bool isCollectionDev = false, CancellationToken token = default)
        {
            if (isCollectionDev)
            {
                _collection = new MongoClient(_config.ConnectionString).GetDatabase("rbpharma-dev").GetCollection<Product>(_collectionName);
            }

            var sortByProperty = GetSortByProperty(filter.SortBy);

            var includesExprice = filter.Origins?.Contains("exprice") ?? false;

            var freeTextFilter = filter.AnyContains is null ? null : Builders<Product>.Filter.Text(filter.AnyContains, new TextSearchOptions
            {
                CaseSensitive = false,
                DiacriticSensitive = false,
            });

            var atcsFilterFilter = filter.ATCContains?
                .Aggregate(new DynamicFilterBuilder<Product>(), (builder, value) => builder.Contains(p => p.ATC, value))
                .Build(false);

            var productCodesFilter = filter.ProductCodesContains is null
                ? null
                : Builders<Product>.Filter.Or(
                    new DynamicFilterBuilder<Product>().Contains(p => p.ProductCode, filter.ProductCodesContains).Build(),
                    new DynamicFilterBuilder<Product>().Contains(p => p.ScrapingOriginIdentifier, filter.ProductCodesContains).Build(),
                    Builders<Product>.Filter.ElemMatch(p => p.Codes, new DynamicFilterBuilder<ProductCode>().Contains(c => c.Value, filter.ProductCodesContains).Build()));

            var manufacturerOrMAHolderFilter = filter.ManufacturerOrMAHolderContains is null ? null : new DynamicFilterBuilder<Product>()
                .Contains(p => p.Manufacturer, filter.ManufacturerOrMAHolderContains)
                .Contains(p => p.MAHolder, filter.ManufacturerOrMAHolderContains)
                .Build(false);
            
            bool? prescription = null;
            prescription= filter.AdditionalInformation?.Contains("Prescription") == true ? true : prescription;
            bool? generic = null;
            generic = filter.AdditionalInformation?.Contains("Generic") == true ? true : generic;
            
            bool? psychotropic = null;
            psychotropic = filter.AdditionalInformation?.Contains("Controled Drug") == true ? true : psychotropic;
            bool? biological = null;
            biological = filter.AdditionalInformation?.Contains("Biological") == true ? true : biological;
            bool? additionalMonitoring = null;
            additionalMonitoring = filter.AdditionalInformation?.Contains("Additional Monitoring") == true ? true : additionalMonitoring;
            bool? hospitalar = null;
            hospitalar = filter.AdditionalInformation?.Contains("Hospitalar") == true ? true : hospitalar;
            bool? precautionsForStorage = null;
            precautionsForStorage = filter.AdditionalInformation?.Contains("Precautions For Storage") == true ? true : precautionsForStorage;
            bool? parallelImport = null;
            parallelImport = filter.AdditionalInformation?.Contains("Parallel Import") == true ? true : parallelImport;
            FilterDefinition<Product> controledDrugFilter = null;
            if (psychotropic!=null)
            {
                var l = new List<FilterDefinition<Product>>();
                var x =Builders<Product>.Filter.Eq(I => I.IsPsychotropic, psychotropic);
                var x2 =Builders<Product>.Filter.Eq(I => I.IsNarcotic, psychotropic);
                l.Add(x);
                l.Add(x2);
                controledDrugFilter= Builders<Product>.Filter.Or(l);
            }

            var filtersBuilder = new DynamicFilterBuilder<Product>()
                .ContainsIfNotNull(p => p.Name, filter.NameContains)
                .CustomIfNotNull(productCodesFilter)
                .CustomIfNotNull(manufacturerOrMAHolderFilter)
                .CustomIfNotNull(atcsFilterFilter)
                .CustomIfNotNull(freeTextFilter)
                .CustomIfNotNull(controledDrugFilter)
                .ContainsAllIfNotNull(p => p.ActiveSubstances, filter.ActiveSubstances)
                .ContainsAllIfNotNull(p => p.AdministrationCategories, filter.Administrations)
                .ContainsAllIfNotNull(p => p.PharmaceuticalFormCategories, filter.PharmaceuticalForms)
                .EqualIfNotNull(p => p.Country, filter.Countries)
                .EqualIfNotNull(p => p.IsAuthorised, filter.IsAuthorized)
                .EqualIfNotNull(p => p.IsMarketed, filter.IsMarketed)
                .EqualIfNotNull(p => p.ScrapingOrigin, filter.Origins)
                .EqualIfNotNull(p => p.IsAdditionalMonitoring, additionalMonitoring)
                .EqualIfNotNull(p => p.IsHospitalar, hospitalar)
                .EqualIfNotNull(p => p.IsBiological, biological)
                //.EqualIfNotNull(p => p.IsPsychotropic, psychotropic)
                .EqualIfNotNull(p => p.IsGeneric, generic)
                .EqualIfNotNull(p => p.IsParallelImport, parallelImport)
                .EqualIfNotNull(p => p.IsPrescription, prescription)
                .ExistIf(p=> p.PrecautionsForStorage, "PrecautionsForStorage", precautionsForStorage!=null)
                .ExistIf(p=>p.ShortageInfo, "ShortageInfo",filter.IsShortage!=null && filter.IsShortage.Value)
                //.EqualIfNotNull(p => p.PrecautionsForStorage, precautionsForStorage)
                //.EqualIfNotNull(p => p.IsAdditionalMonitoring, filter)
                //.GreaterThan(p => p.LastUpdate, DateTime.UtcNow.AddDays(-12))
                .NotEqual(p => p.IsDeleted, true)
                .NotEqualIf(p => p.IsDuplicated, true, !includesExprice);


            if (negatedFilter != null)
            {
                filtersBuilder = filtersBuilder
                    .NotContainsIfNotNull(p => p.Name, negatedFilter.NameContains)
                    //.CustomIfNotNull(productCodesFilter)
                    //.CustomIfNotNull(manufacturerOrMAHolderFilter)
                    //.CustomIfNotNull(atcsFilterFilter)
                    //.CustomIfNotNull(freeTextFilter)
                    .NotContainsAllIfNotNull(p => p.ActiveSubstances, negatedFilter.ActiveSubstances)
                    .NotContainsAllIfNotNull(p => p.AdministrationCategories, negatedFilter.Administrations)
                    .NotContainsAllIfNotNull(p => p.PharmaceuticalFormCategories, negatedFilter.PharmaceuticalForms)
                    .NotEqualIfNotNull(p => p.Country, negatedFilter.Countries)
                    .NotEqualIfNotNull(p => p.IsAuthorised, negatedFilter.IsAuthorized)
                    .NotEqualIfNotNull(p => p.IsMarketed, negatedFilter.IsMarketed)
                    .NotEqualIfNotNull(p => p.ScrapingOrigin, negatedFilter.Origins);
            }

            var filters = filtersBuilder.Build();

            var totalTask = _collection
                .Find(filters)
                .CountDocumentsAsync(token);

            var find = _collection
                    .Find(filters);
                    //.Skip(offset)
                    //.Limit(pageSize);

            if (sortByProperty != null)
            {
                var sort = filter.SortDescending
                    ? Builders<Product>.Sort.Descending(sortByProperty.Name)
                    : Builders<Product>.Sort.Ascending(sortByProperty.Name);

                find = find.Sort(sort);
            }

            return (
                Items: await find.ToListAsync(token),
                Total: await totalTask);
        }

        public Task<List<Product>> GetProductsByIdAsync(IEnumerable<ObjectId> ids, CancellationToken token = default) =>
            _collection.Find(Builders<Product>.Filter.In(p => p.Id, ids)).ToListAsync(token);
        public Task<List<string>> GetAllCountries(CancellationToken token) =>
            _collection.Distinct(p => p.Country, Builders<Product>.Filter.Empty).ToListAsync(token);
        public Task<List<string>> GetAllOrigins(CancellationToken token) =>
            _collection.Distinct(p => p.ScrapingOrigin, Builders<Product>.Filter.Empty).ToListAsync(token);
        public async Task<List<string>> GetAllActiveSubstances(CancellationToken token) {
            await Task.Delay(0);
            var r = File.ReadAllLines("C:\\RBPharmaPlatform\\Data\\Dcis-new.csv").Select(I=>I.Split(" + ",StringSplitOptions.RemoveEmptyEntries)).SelectMany(I=>I).Distinct().Select(I=>I.Trim()).OrderBy(i=>i).ToList();
            var x2 = r.Select(I => I.TrimStart()).ToList();
            
            return r;
        }

        public async Task<List<string>> GetAllATCs(CancellationToken token) {
            await Task.Delay(0);
            var r = File.ReadAllLines("C:\\RBPharmaPlatform\\Data\\Atcs.csv").Distinct().ToList();
            int i = 0;
            string s = null;
            var r2 = r.Select(I =>
            {
                s= I;
                var x = I.Split(" - ");
                i++;
                return x[0] + " - " + x[1][0].ToString().ToUpper() + x[1][1..].ToLower();
            }).ToList();
            return r2;
        }
        public async Task<List<string>> GetAllPharmaceuticalForms(CancellationToken token)
        {
            var r = _collection.Distinct<object>(nameof(Product.PharmaceuticalFormCategories), Builders<Product>.Filter.Empty).ToList();
            var ret = new List<string>();
            foreach (var item in r)
            {
                if (item == null)
                {
                    continue;
                }
                if (typeof(string) == item.GetType())
                {
                    if (item.ToString().StartsWith("'"))
                    {
                        ret.Add(item.ToString()[1..]);
                        continue;
                    }
                    ret.Add(item.ToString());
                }
                else
                {
                    _ = ";";
                }
            }
            await Task.CompletedTask;
            return ret.Distinct().OrderBy(I=>I).ToList();
            //return _collection.Distinct<string>(nameof(Product.PharmaceuticalFormCategories), Builders<Product>.Filter.Empty).ToListAsync(token);
        }
        public async Task<List<string>> GetAllAdministrations(CancellationToken token)
        {
            var _co = _collection.Distinct<object>(nameof(Product.AdministrationCategories), Builders<Product>.Filter.Empty).ToList();
            var list = new List<string>();
            foreach (var c in _co)
            {
                if (c == null)
                {
                    continue;
                }
                if (typeof(string) == c.GetType())
                {
                    if (string.IsNullOrEmpty(c.ToString()))
                    {
                        continue;
                    }
                    var r = string.Join("",c.ToString().Split(" ",StringSplitOptions.RemoveEmptyEntries));


                    list.Add(r);
                }
                else
                {
                    _ = ";";
                }
            }
            await Task.CompletedTask;
            return list.Distinct().ToList();
            //return _collection.Distinct<string>(nameof(Product.AdministrationCategories), Builders<Product>.Filter.Empty).ToListAsync(token);

        }

        public async Task UpdateProductAsync(string executionId, Product product, bool isCollectionDev = false, CancellationToken token = default)
        {
            if (isCollectionDev)
            {
                _collection = new MongoClient(_config.ConnectionString).GetDatabase("rbpharma-dev").GetCollection<Product>(_collectionName);
            }

            var productMongo = _collection.Find(x => x.Country == product.Country && x.ScrapingOriginIdentifier == product.ScrapingOriginIdentifier).FirstOrDefault();

            if (productMongo != null)
            {
                product.History = productMongo.History;

                if (product.History == null)
                {
                    product.History = new List<ProductHistory>();
                }

                var logProduct = await _scrapperStorage.GetProductAlteredByExecutionId(executionId, product.ScrapingOriginIdentifier, token);

                product.History.Add(new ProductHistory()
                {
                    ChangedDate = DateTime.UtcNow,
                    LogExecution = logProduct
                });

                _ignoredFields = new string[]{
                    nameof(ProductEnriched.ScrapingOrigin),
                    nameof(ProductEnriched.ScrapingOriginIdentifier),
                    nameof(ProductEnriched.ScrapingOriginUrl),
                    nameof(ProductEnriched.ProductCode),
                    nameof(Product.Id)
                };
            }
            else
            {
                _ignoredFields = new string[] { };
            }

            var updates = typeof(Product)
                .GetProperties()
                .Where(property => !_ignoredFields.Contains(property.Name))
                .Select(property => property.GetValue(product) != null
                    ? Builders<Product>.Update.Set(new StringFieldDefinition<Product, object>(property.Name), property.GetValue(product))
                    : Builders<Product>.Update.Unset(new StringFieldDefinition<Product>(property.Name)));

            var result = await _collection.UpdateOneAsync(
                p => p.Country == product.Country && p.ScrapingOriginIdentifier == product.ScrapingOriginIdentifier,
                Builders<Product>.Update.Combine(updates),
                new UpdateOptions { IsUpsert = true },
                token);
        }

        public async Task<Product> GetProductAsync(string countryCode, string productCode, CancellationToken token)
        {
            var p = await _collection.Find(I => I.Country == countryCode && I.ProductCode == productCode).Limit(1).SingleOrDefaultAsync();
            return p;
        }
    }
}
