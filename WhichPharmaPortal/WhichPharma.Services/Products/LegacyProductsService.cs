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
using DbProduct = WhichPharma.Models.Database.Products.LegacyProduct;
using DbProductStatus = WhichPharma.Models.Database.Products.LegacyProductStatus;

namespace WhichPharma.Services.Products
{
    public class LegacyProductsService : ILegacyProductsService
    {
        private readonly ILegacyProductsStorage _productsStorage;

        static LegacyProductsService()
        {
            TypeAdapterConfig.GlobalSettings.NewConfig<DbProduct, ProductV1>()
                .IgnoreNullValues(true)
                .Map(dest => dest.Country, src => CountryList.GetName(src.Country))
                .Map(dest => dest.CountryCode, src => src.Country)
                .AfterMapping((src, dest) => EnrichProduct(src, dest))
                .Compile();
        }

        public LegacyProductsService(ILegacyProductsStorage productsStorage)
        {
            _productsStorage = productsStorage;
        }

        private static ProductV1 EnrichProduct(DbProduct source, ProductV1 product)
        {
            if(product.ShortageInfo != null)
            {
                product.AdaptStatusWithShortage(product.ShortageInfo.Start, product.ShortageInfo.End, product.ShortageInfo.Type);
            }

            return product;
        }

        public Task<SearchResult<ProductV1>> GetProductsAsync(GetLegacyProductsFilters filters, int offset, int pageSize, CancellationToken token = default)
        {
            return GetProductsAsync(filters, null, offset, pageSize, token);
        }

        public Task<SearchResult<ProductV1>> GetProductsAsync(GetLegacyProductsFilters filters, GetLegacyProductsFilters negatedfilters, int offset, int pageSize, CancellationToken token = default)
        {
            var dbFilter = ConvertFilters(filters);
            var dbNegatedFilter = negatedfilters == null ? null : ConvertFilters(filters);

            return _productsStorage.GetProductsAsync(dbFilter, dbNegatedFilter, offset, pageSize, token)
                .Select(result => new SearchResult<ProductV1>
                {
                    Total = (int)result.Total,
                    Items = result.Items.Select(product => product.Adapt<ProductV1>()).ToList()
                });
        }

        private static LegacyProductsFilter ConvertFilters(GetLegacyProductsFilters filters) => new LegacyProductsFilter
        {
            AnyContains = filters.FreeText,
            NameContains = filters.Name,
            ATCContains = filters.Atc?.Split(new char[] { ',' }).Select(s => s.Trim()),
            SortBy = filters.SortBy,
            SortDescending = filters.SortType == "desc",
            IncludeExprice = filters.IncludeExprice,
            ActiveSubstances = filters.ActiveSubstances?.Split(new char[] { ',' }).Select(s => s.Trim()),
            DrugForms = filters.DrugForms?.Split(new char[] { ',' }).Select(s => s.Trim()),
            AdministrationForms = filters.AdministrationForms?.Split(new char[] { ',' }).Select(s => s.Trim()),
            Countries = filters.Countries?.Split(new char[] { ',' }).Select(s => s.Trim()),
            ProductCodeOrMANumberContains = filters.ProductCode,
            ManufacturerOrMAHolderContains = filters.Holder,
            Origins = filters.Origins?.Split(new char[] { ',' }).Select(s => s.Trim()),
            Statuses = filters.Statuses?.Split(new char[] { ',' })
                        .Select(s => s.Trim().Adapt<DbProductStatus>()),
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
    }
}
