using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Gmail.v1;
using Google.Apis.Oauth2.v2.Data;
using Google.Apis.Services;
using Google.Apis.Util.Store;
using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace WhichPharma.Services.GoogleServices
{
    public class GoogleService : IGoogleService
    {
        private static string ApplicationName = "WhichPharma";

        private readonly ClientSecrets _clientSecrets;
        private readonly GoogleAuthorizationCodeFlow _gmailAuthorizationFlow;
        private readonly FileDataStore _gmailDataStore;
        private readonly IGoogleServiceConfig _config;

        public GoogleService(IGoogleServiceConfig config)
        {
            _config = config;

            using (var stream = new FileStream(_config.ApplicationCredentialsFile, FileMode.Open, FileAccess.Read))
            {
                _clientSecrets = GoogleClientSecrets.Load(stream).Secrets;
            }

            _gmailAuthorizationFlow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
            {
                DataStore = new FileDataStore(_config.DataStoreFolder),
                ClientSecrets = _clientSecrets,
                Scopes = new[]
                {
                    GmailService.Scope.GmailCompose,
                },
            });

            _gmailDataStore = new FileDataStore(_config.DataStoreFolder);
        }

        private async Task<string> GetEmailForTokenAsync(TokenResponse response, CancellationToken token)
        {
            var service = new Google.Apis.Oauth2.v2.Oauth2Service(new BaseClientService.Initializer()
            {
                HttpClientInitializer = new UserCredential(_gmailAuthorizationFlow, null, response),
                ApplicationName = ApplicationName,
            });

            var user = await service.Userinfo.Get().ExecuteAsync(token);

            return user.Email;
        }

        private static string EscapeCode(string code)
        {
            return new string(code.Select(c => char.IsLetterOrDigit(c) ? c : 'a').ToArray());
        }

        private async Task<GoogleCredential> GetImpersonatedCredential(CancellationToken token, string accountToImpersonate = null)
        {
            return (await GoogleCredential.FromFileAsync(_config.ServiceAccountCredentialsFile, token))
                .CreateScoped(GmailService.Scope.GmailCompose)
                .CreateWithUser(accountToImpersonate ?? _config.ServiceAccountImpersonate);
        }

        private async Task<UserCredential> GetCredentialAsync(string code, CancellationToken token, string userId = null)
        {
            var tokenResponse = await _gmailDataStore.GetAsync<TokenResponse>(userId ?? EscapeCode(code));
            var save = false;

            if (tokenResponse == null)
            {
                tokenResponse = await _gmailAuthorizationFlow.ExchangeCodeForTokenAsync(
                    userId ?? EscapeCode(code),
                    code,
                    _config.APIRedirectUrl,
                    token);

                save = true;
            }

            var credential = new UserCredential(_gmailAuthorizationFlow, userId, tokenResponse);

            if (credential.Token.IsExpired(Google.Apis.Util.SystemClock.Default))
            {
                await credential.RefreshTokenAsync(token);
                save = true;
            }

            if (save)
            {
                if (userId == null)
                {
                    await _gmailDataStore.StoreAsync(EscapeCode(code), tokenResponse);
                    await _gmailDataStore.StoreAsync(await GetEmailForTokenAsync(tokenResponse, token), tokenResponse);
                }
                else
                {
                    await _gmailDataStore.StoreAsync(userId, tokenResponse);
                }
            }

            return credential;
        }

        public async Task<GmailService> GetImpersonatedGmailServiceAsync(string gmailToImpersonate, CancellationToken token)
        {
            return new GmailService(new BaseClientService.Initializer()
            {
                HttpClientInitializer = await GetImpersonatedCredential(token, gmailToImpersonate),
                ApplicationName = ApplicationName,
            });
        }

        public async Task<GmailService> GetGmailServiceAsync(string gmail, string code, CancellationToken token)
        {
            return new GmailService(new BaseClientService.Initializer()
            {
                HttpClientInitializer = await GetCredentialAsync(code, token, gmail),
                ApplicationName = ApplicationName,
            });
        }

        public async Task<Userinfo> GetUserProfileAsync(string code, CancellationToken token)
        {
            var service = new Google.Apis.Oauth2.v2.Oauth2Service(new BaseClientService.Initializer()
            {
                HttpClientInitializer = await GetCredentialAsync(code, token),
                ApplicationName = ApplicationName,
            });
            return await service.Userinfo.Get().ExecuteAsync(token);
        }
    }
}
