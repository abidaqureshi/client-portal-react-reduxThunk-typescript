using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Database.Services;
using WhichPharmaPortal.Models.Client;
using WhichPharma.Models.Server;
using DbShortageType = WhichPharma.Models.Products.ShortageType;
using DbShortage = WhichPharma.Models.Products.Shortage;
using DbShortagesFilters = WhichPharma.Database.Filters.ShortagesFilter;
using DbProductIdentifier = WhichPharma.Models.Products.SyncData;
using System.Linq;
using System;
using System.Collections.Generic;
using WhichPharma.Utils.Exceptions;
using WhichPharma.Services.Products;
using Mapster;
using WhichPharma.Utils;

namespace WhichPharma.Services.Shortages
{
    public class ShortagesService : IShortagesService
    {
        private readonly IShortagesStorage _shortagesStorage;
        private readonly ILegacyProductsService _productsService;

        static ShortagesService()
        {
            TypeAdapterConfig.GlobalSettings.NewConfig<DbProductIdentifier, ProductV1>()
                .IgnoreNullValues(true)
                .Map(p => p.ActiveSubstances, src => string.IsNullOrEmpty(src.ActiveSubstances)
                    ? new string[0]
                    : new string[] { src.ActiveSubstances })
                .Compile();

            TypeAdapterConfig.GlobalSettings.NewConfig<DbShortage, Shortage>()
                .IgnoreNullValues(true)
                .Map(p => p.Product, src => src.SyncData.Adapt<ProductV1>() ?? src.SyncData.Adapt<ProductV1>())
                .Map(p => p.Country, src => CountryList.GetName(src.Country))
                .Map(p => p.CountryCode, src => src.Country)
                .Compile();
        }

        public ShortagesService(IShortagesStorage shortageStorage, ILegacyProductsService productsService)
        {
            _shortagesStorage = shortageStorage;
            _productsService = productsService;
        }

        private static IEnumerable<DbShortageType> ParseTypes(string types)
        {
            if (types == null) return null;

            try
            {
                return types
                    .Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(str => str.Trim().Adapt<DbShortageType>())
                    .ToList();
            }
            catch (Exception)
            {
                throw new InvalidParameterException($"Invalid value: {types}", nameof(GetShortagesFilters.Types));
            }
        }

        private static DateTime? ParseDate(string str, string fieldName)
        {
            if (str == null) return null;
            return DateTime.TryParse(str, out var date)
                ? date
                : throw new InvalidParameterException($"Invalid value: {str}", fieldName);
        }

        public async Task<SearchResult<Shortage>> GetShortagesAsync(GetShortagesFilters filters, int offset, int pageSize, CancellationToken token = default)
        {
            var dbFilters = new DbShortagesFilters
            {
                Countries = filters.Countries?.Split(new char[] { ',' }).Select(s => s.Trim()),
                Origins = filters.Origins?.Split(new char[] { ',' }).Select(s => s.Trim()),
                Types = filters.Types == null ? null : ParseTypes(filters.Types),
                StartFrom = ParseDate(filters.MinStartDate, nameof(filters.MinStartDate)),
                StartTo = ParseDate(filters.MaxStartDate, nameof(filters.MaxStartDate)),
                EndFrom = ParseDate(filters.MinEndDate, nameof(filters.MinEndDate)),
                EndTo = ParseDate(filters.MaxEndDate, nameof(filters.MaxEndDate)),
            };

            var results = await _shortagesStorage.GetShortagesAsync(dbFilters, offset, pageSize, token);

            var mappedShortages = results.Items.Select(dbShortage => dbShortage.Adapt<Shortage>());

            var shortages = (await _productsService.FillShortagesProductInfo(mappedShortages));

            return new SearchResult<Shortage>
            {
                Total = (int)results.Total,
                Items = shortages.ToList()
            };
        }
    }
}
