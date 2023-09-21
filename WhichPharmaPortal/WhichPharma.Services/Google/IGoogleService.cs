using Google.Apis.Gmail.v1;
using Google.Apis.Oauth2.v2.Data;
using System.Threading;
using System.Threading.Tasks;

namespace WhichPharma.Services.GoogleServices
{
    public interface IGoogleService
    {
        Task<GmailService> GetImpersonatedGmailServiceAsync(string gmailToImpersonate, CancellationToken token);
        Task<GmailService> GetGmailServiceAsync(string gmail, string code, CancellationToken token);
        Task<Userinfo> GetUserProfileAsync(string code, CancellationToken token);
    }
}
