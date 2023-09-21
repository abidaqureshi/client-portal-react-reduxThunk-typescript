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
using DbProduct = WhichPharma.Models.Database.Products.Product;
using ProductDocument = WhichPharma.Models.Products.ProductDocument;
using System;
//using WhichPharma.Models.Database.Products;

namespace WhichPharma.Services.Products
{
    public class ProductsService : IProductsService
    {
        private readonly IProductsStorage _productsStorage;

        private static T DefaultIfNull<V, T>(V v, Func<V, T> getter) => v == null ? default : getter(v);

        static ProductsService()
        {
            TypeAdapterConfig.GlobalSettings.NewConfig<DbProduct, ProductV2>()
                .IgnoreNullValues(true)
                .Map(dest => dest.CountryName, src => DefaultIfNull(src.Country, v => CountryList.GetName(v)))
                .Map(dest => dest.CountryCode, src => src.Country)
                .Map(dest => dest.Codes, src => DefaultIfNull(src.Codes, codes => codes.Where(x => x.Type != null).ToDictionary(c => c.Type, c => c.Value)))
                .Map(dest => dest.OtherFields, src => DefaultIfNull(src.OtherFields, otherFields => otherFields.Where(x => x.Name != null).ToDictionary(f => f.Name, f => f.Value)))
                .Map(dest => dest.StrengthDetailed, src => DefaultIfNull(src.StrengthDetailed, strength => string.Join(" + ", strength.Select(s => s.ToString()))))
                .Map(dest => dest.PackageDetailed, src => DefaultIfNull(src.PackageDetailed, package => string.Join(" + ", package.Select(s => s.ToString()))))
                .Map(dest => dest.Documents, src => DefaultIfNull(src.Documents, docs =>
                    new ProductDocument[] { new ProductDocument { Type = "Web", Url = src.ScrapingOriginUrl } }
                        .Concat(docs)
                        .Where(d => !string.IsNullOrWhiteSpace(d.Url))
                        .ToDictionary(d => d.Type, d => d.Url)))
                .Compile();
        }

        public ProductsService(IProductsStorage productsStorage)
        {
            _productsStorage = productsStorage;
        }

        public Task<SearchResult<ProductV2>> GetProductsAsync(GetProductsFilters filters, int offset, int pageSize, bool isCollectionDev = false, CancellationToken token = default)
        {
            return GetProductsAsync(filters, null, offset, pageSize, isCollectionDev, token);
        }

        public Task<SearchResult<ProductV2>> GetProductsAsync(GetProductsFilters filters, GetProductsFilters negatedFilters, int offset, int pageSize, bool isCollectionDev = false, CancellationToken token = default)
        {
            var dbFilter = ConvertFilters(filters);
            var dbNegatedFilter = negatedFilters == null ? null : ConvertFilters(negatedFilters);
            return _productsStorage.GetProductsAsync(dbFilter, dbNegatedFilter, offset, pageSize, isCollectionDev, token)
                .Select(result => new SearchResult<ProductV2>
                {
                    Total = (int)result.Total,
                    Items = result.Items.Select(product => { var r = product.Adapt<ProductV2>();
                        
                        r.IsMarketed = (r.IsAuthorised.HasValue && r.IsAuthorised.Value) || !r.IsAuthorised.HasValue ? r.IsMarketed : false; 
                        
                        //r.IsMarketed = r.IsMarketed.HasValue ? r.IsMarketed : true;
                        return r;
                        }).ToList()
                });
        }

        private static ProductsFilter ConvertFilters(GetProductsFilters filters) => new ProductsFilter
        {
            AnyContains = filters.FreeText,
            NameContains = filters.Name,
            ATCContains = filters.Atc?.Split(new char[] { ',' }).Select(s => s.Trim()),
            Administrations = filters.Administrations?.Split(new char[] { ',' }).Select(s => s.Trim()),
            PharmaceuticalForms = filters.PharmaceuticalForms?.Split(new char[] { ',' }).Select(s => s.Trim()),
            SortBy = filters.SortBy,
            SortDescending = filters.SortType == "desc",
            ActiveSubstances = filters.ActiveSubstances?.Split(new char[] { ',' }).Select(s => s.Trim()),
            Countries = filters.Countries?.Split(new char[] { ',' }).Select(s => s.Trim()),
            ProductCodesContains = filters.ProductCode,
            ManufacturerOrMAHolderContains = filters.Holder,
            IsShortage = filters.IsShortage,
            AdditionalInformation=filters.AdditionalInformation?.Split(new char[] {','}).Select(i=>i.Trim()),
            Origins = filters.Origins?.Split(new char[] { ',' }).Select(s => s.Trim()),
            IsAuthorized = filters.IsAuthorised == null ? default(bool?) : (filters.IsAuthorised == "yes"),
            IsMarketed = filters.IsMarketed?.Split(new char[] { ',' }).Select(filter => filter switch
            {
                "yes" => true as bool?,
                "no" => false,
                _ => default,
            }),
        };

        public async Task<IEnumerable<Shortage>> FillShortagesProductInfo(IEnumerable<Shortage> shortages, CancellationToken token = default)
        {
            var productsIds = shortages
                .Where(shortage => shortage != null && shortage.ProductId != null)
                .Select(shortage => new ObjectId(shortage.ProductId));

            var products = await _productsStorage.GetProductsByIdAsync(productsIds, token);

            return shortages.Select(shortage =>
            {
                if (shortage.ProductId != null)
                {
                    var productId = (ObjectId?)new ObjectId(shortage.ProductId);
                    shortage.Product = products.FirstOrDefault(p => p.Id == productId).Adapt(shortage.Product);
                }
                shortage.Product?.AdaptStatusWithShortage(shortage.Start, shortage.End, shortage.Type);
                return shortage;
            });
        }

        public async Task<ProductV2> GetProductAsync(string countryCode, string productCode, CancellationToken token)
        {
            DbProduct p = await _productsStorage.GetProductAsync(countryCode, productCode, token);

            return p?.Adapt<ProductV2>();
        }
    }
}
