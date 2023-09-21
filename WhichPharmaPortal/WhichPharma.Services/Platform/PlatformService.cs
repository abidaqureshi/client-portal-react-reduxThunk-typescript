using Mapster;
using Mapster.Utils;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Database.Services;
using WhichPharmaPortal.Models.Client;
using DbProcessingSettings = WhichPharma.Models.Database.Platform.ProcessingSettings;
using DbHarmonizedPform = WhichPharma.Models.Database.Platform.HarmonizedPform;
using DbHarmonizeCatForm = WhichPharma.Models.Database.Platform.HarmonizeCatForm;
using DbHarmonizeAtc = WhichPharma.Models.Database.Platform.HarmonizedATC;
using DbDrugForm = WhichPharma.Models.Products.PharmaceuticalForm;
using DbAdministrationForm = WhichPharma.Models.Products.Administration;
using DbPharmaUnits = WhichPharma.Models.Products.PharmaUnits;
using WhichPharma.Queue;
using WhichPharma.StandardTerms;
using System.Collections.Generic;

namespace WhichPharma.Services.Platform
{
    public class PlatformService : IPlatformService
    {
        private readonly IPlatformStorage _platformStorage;
        private readonly IQueueClient _queueClient;
        private readonly IStandardTermsClient _standardTerms;

        public PlatformService(IPlatformStorage platformStorage, IQueueClient queueClient, IStandardTermsClient standardTerms)
        {
            _platformStorage = platformStorage;
            _queueClient = queueClient;
            _standardTerms = standardTerms;
        }
        static PlatformService()
        {
            TypeAdapterConfig.GlobalSettings.NewConfig<DbProcessingSettings, ProcessingSettings>()
                .IgnoreNullValues(true)
                .Map(dest => dest.DrugFormsMap, src => src.DrugFormsMap.ToDictionary(p => p.Key.ToString(), p => p.Value))
                .Map(dest => dest.AdministrationFormsMap, src => src.AdministrationFormsMap.ToDictionary(p => p.Key.ToString(), p => p.Value))
                .Map(dest => dest.PharmaUnitsMap, src => src.PharmaUnitsMap.ToDictionary(p => p.Key.ToString(), p => p.Value))
                .Compile();

            TypeAdapterConfig.GlobalSettings.NewConfig<ProcessingSettings, DbProcessingSettings>()
                .IgnoreNullValues(true)
                .Map(dest => dest.DrugFormsMap, src => src.DrugFormsMap.ToDictionary(p => Enum<DbDrugForm>.Parse(p.Key), p => p.Value))
                .Map(dest => dest.AdministrationFormsMap, src => src.AdministrationFormsMap.ToDictionary(p => Enum<DbAdministrationForm>.Parse(p.Key), p => p.Value))
                .Map(dest => dest.PharmaUnitsMap, src => src.PharmaUnitsMap.ToDictionary(p => Enum<DbPharmaUnits>.Parse(p.Key), p => p.Value))
                .Compile();
        }

        public async Task<ProcessingSettings> GetProcessingSettingsAsync(string origin, CancellationToken token)
        {
            var db = await _platformStorage.GetProcessingSettingsForOriginAsync(origin, token);
            return db.Adapt<ProcessingSettings>();
        }

        public async Task UpdateProcessingSettingsAsync(string origin, ProcessingSettings settings, CancellationToken token)
        {
            var db = settings.Adapt<DbProcessingSettings>();
            db.ScrappingOrigin = origin;
            await _platformStorage.UpdatingProcessingSettingsForOrigin(db, token);
        }

        public Task ReprocessProductsAsync(string origin, string[] valuesAffected, CancellationToken token)
        {
            _queueClient.PublishProductMappingChanged(origin, valuesAffected);
            return _queueClient.WaitForConfirmsAsync(token);
        }

        public async Task<TermsTranslations> GetTermsTranslationsAsync(string language, CancellationToken token)
        {
            var res = await _standardTerms.GetTranslationsAsync(language, token);
            return new TermsTranslations
            {
                AdministrationMap = res.AdministrationMap.ToDictionary(v => v.Key.ToString(), v => v.Value),
                PharmaceuticalFormMap = res.PharmaceuticalFormMap.ToDictionary(v => v.Key.ToString(), v => v.Value),
            };
        }

        public async Task<List<HarmonizedPform>> GetFormsAsync(string country, CancellationToken token)
        {
            var res = await _platformStorage.GetFormsAsync(country);
            return res.Adapt<List<HarmonizedPform>>();

        }

        public async Task<List<HarmonizeCatForm>> GetCatPformsAsync()
        {
            var res = await _platformStorage.GetCatPformsAsync();
            return res.Adapt<List<HarmonizeCatForm>>();
        }

        public async Task<List<HarmonizedPform>> GetDCIAsync(string country, CancellationToken token)
        {
            var res = await _platformStorage.GetDCIAsync(country);
            return res.Adapt<List<HarmonizedPform>>();

        }

        public async Task RestoreBackupAsync(List<HarmonizedPform> pforms, List<HarmonizedPform> dci, List<HarmonizeCatForm> cat, string origin)
        {
            await _platformStorage.RestoreBackupAsync(pforms.Adapt<List<DbHarmonizedPform>>(), dci.Adapt<List<DbHarmonizedPform>>(), cat.Adapt<List<DbHarmonizeCatForm>>(), origin);
        }

        public async Task<List<HarmonizedATC>> GetATCAsync()
        {
            return (await _platformStorage.GetATCAsync()).Adapt<List<HarmonizedATC>>();
        }

        public async Task ReplacePformsAsync(HarmonizedPform item)
        {
            await _platformStorage.RelacePformAsync(item.Adapt<DbHarmonizedPform>());
        }
    }
}
