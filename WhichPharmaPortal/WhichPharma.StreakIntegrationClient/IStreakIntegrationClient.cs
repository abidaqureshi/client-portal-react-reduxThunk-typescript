using System.Threading;
using System.Threading.Tasks;

namespace WhichPharma.StreakIntegration
{
    public interface IStreakIntegrationClient
    {
        Task CreateRFQ(string streakApiKey, string rfqNr, string rfqTitle, string assignTo, string[] gmailThreadIds, CancellationToken token);
    }
}
