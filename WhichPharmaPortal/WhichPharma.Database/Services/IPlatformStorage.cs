using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Models.Database.Platform;
//using HarmonizedPform = WhichPharmaPortal.Models.Client.HarmonizedPform;

namespace WhichPharma.Database.Services
{
    public interface IPlatformStorage
    {
        Task<ProcessingSettings> GetProcessingSettingsForOriginAsync(string scrapingOrigin, CancellationToken token = default);
        Task UpdatingProcessingSettingsForOrigin(ProcessingSettings settings, CancellationToken token = default);
        Task<List<HarmonizedPform>> GetFormsAsync(string country);
        Task<List<HarmonizeCatForm>> GetCatPformsAsync();
        Task<List<HarmonizedPform>> GetDCIAsync(string country);
        Task RestoreBackupAsync(List<HarmonizedPform> pforms, List<HarmonizedPform> dci, List<HarmonizeCatForm> cat, string origin);
        Task<List<HarmonizedATC>> GetATCAsync();
        Task RelacePformAsync(HarmonizedPform item);
    }
}
