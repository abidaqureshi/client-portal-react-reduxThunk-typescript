using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Database.Config;
using WhichPharma.Models.Database.Platform;
//using HarmonizedPform = WhichPharmaPortal.Models.Client.HarmonizedPform;

namespace WhichPharma.Database.Services.Implementations
{
    public class PlatformStorage : IPlatformStorage
    {
        private const string _collectionName = "platformSettings";
        private const string _pformsCollection = "platform-pformsV2";
        private const string _catCollection = "platform-Cat";
        private const string _atcCollection = "platform-ATC";
        private const string _dciCollection = "platform-dci";
        private readonly IMongoDatabase _database;

        public PlatformStorage(IStorageConfig<PlatformStorage> config)
        {
            _database =  new MongoClient(config.ConnectionString).GetDatabase(config.DatabaseName);
        }

        public Task<List<HarmonizedATC>> GetATCAsync()
        {
            return _database.GetCollection<HarmonizedATC>(_atcCollection).Find(i=>true).ToListAsync();
        }

        public Task<List<HarmonizeCatForm>> GetCatPformsAsync()
        {
            return _database.GetCollection<HarmonizeCatForm>(_catCollection).Find(i=>true).ToListAsync();
        }

        public Task<List<HarmonizedPform>> GetDCIAsync(string country)
        {
            return _database.GetCollection<HarmonizedPform>(_dciCollection).Find(i => i.Country == country.ToLower()).ToListAsync();
        }

        public Task<List<HarmonizedPform>> GetFormsAsync(string country)
        {
            return _database.GetCollection<HarmonizedPform>(_pformsCollection).Find(i=>i.Country == country.ToLower()).ToListAsync();
        }

        public Task<ProcessingSettings> GetProcessingSettingsForOriginAsync(string scrapingOrigin, CancellationToken token = default)
        {
            return _database.GetCollection<ProcessingSettings>(_collectionName)
                .Find(s => s.SettingsType == PlatformSettingsType.ProcessingSettings && s.ScrappingOrigin == scrapingOrigin)
                .FirstOrDefaultAsync(token);
        }

        public async Task RelacePformAsync(HarmonizedPform item)
        {
            await _database.GetCollection<HarmonizedPform>(_pformsCollection).ReplaceOneAsync(I => I.Original == item.Original && item.Country == I.Country, item);
        }

        public async Task RestoreBackupAsync(List<HarmonizedPform> pforms, List<HarmonizedPform> dci, List<HarmonizeCatForm> cat, string origin)
        {
            _database.GetCollection<HarmonizedPform>(_pformsCollection).DeleteMany(I => I.Country == origin.ToLowerInvariant());
            await _database.GetCollection<HarmonizedPform>(_pformsCollection).InsertManyAsync(pforms);
            _database.GetCollection<HarmonizedPform>(_dciCollection).DeleteMany(I => I.Country == origin.ToLowerInvariant());
            await _database.GetCollection<HarmonizedPform>(_dciCollection).InsertManyAsync(dci);
            _database.GetCollection<HarmonizeCatForm>(_catCollection).DeleteMany(I => true);
            await _database.GetCollection<HarmonizeCatForm>(_catCollection).InsertManyAsync(cat);
        }

        public Task UpdatingProcessingSettingsForOrigin(ProcessingSettings settings, CancellationToken token = default)
        {
            return _database.GetCollection<ProcessingSettings>(_collectionName)
                .ReplaceOneAsync(
                    s => s.SettingsType == PlatformSettingsType.ProcessingSettings && s.ScrappingOrigin == settings.ScrappingOrigin,
                    settings,
                    new ReplaceOptions { IsUpsert = true },
                    token);
        }
    }
}
