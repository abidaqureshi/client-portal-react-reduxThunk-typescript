using System.Threading;
using System.Threading.Tasks;
using WhichPharma.StandardTerms.Models;

namespace WhichPharma.StandardTerms
{
    public interface IStandardTermsClient
    {
        Task<TermsMappings> GetTranslationsAsync(string language, CancellationToken token);
    }
}
