using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WhichPharmaPortal.Models.Client;

namespace WhichPharma.Services.Platform
{
    public interface IPlatformService
    {
        Task<ProcessingSettings> GetProcessingSettingsAsync(string origin, CancellationToken token);
        Task UpdateProcessingSettingsAsync(string origin, ProcessingSettings settings, CancellationToken token);
        Task ReprocessProductsAsync(string origin, string[] valuesAffected, CancellationToken token);
        Task<TermsTranslations> GetTermsTranslationsAsync(string language, CancellationToken token);
        Task<List<HarmonizedPform>> GetFormsAsync(string country, CancellationToken token);
        Task<List<HarmonizeCatForm>> GetCatPformsAsync();
        Task<List<HarmonizedPform>> GetDCIAsync(string country, CancellationToken token);
        Task RestoreBackupAsync(List<HarmonizedPform> pforms, List<HarmonizedPform> dci, List<HarmonizeCatForm> cat, string origin);
        Task<List<HarmonizedATC>> GetATCAsync();
        Task ReplacePformsAsync(HarmonizedPform item);
    }
}
