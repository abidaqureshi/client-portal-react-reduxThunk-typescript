using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Polly;
using Polly.Retry;
using System;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace WhichPharma.StreakIntegration
{
    public class StreakIntegrationClient : IStreakIntegrationClient
    {
        private readonly ILogger<StreakIntegrationClient> _logger;
        private readonly IStreakIntegrationClientConfig _config;
        private readonly IHttpClientFactory _clientFactory;

        private readonly Uri _rfqsUri;
        private readonly AsyncRetryPolicy _retryPolicy;

        public StreakIntegrationClient(ILogger<StreakIntegrationClient> logger, IStreakIntegrationClientConfig config, IHttpClientFactory clientFactory)
        {
            _logger = logger;
            _config = config;
            _clientFactory = clientFactory;

            var baseUri = new Uri(_config.ApiBaseUrl);
            _rfqsUri = new Uri(baseUri, "RFQs");

            _retryPolicy = Policy.Handle<Exception>().WaitAndRetryAsync(
                3,
                retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                onRetry: (ex, count) => _logger.LogWarning(ex, $"Error! Retrying ({count})"));
        }

        public async Task CreateRFQ(string streakApiKey, string rfqNr, string name, string assignEmail, string[] threadGmailIds, CancellationToken token)
        {
            var client = _clientFactory.CreateClient();
            var body = new StringContent(JsonConvert.SerializeObject(new
            {
                streakApiKey,
                name,
                rfqNr,
                assignEmail,
                threadGmailIds,
            }), Encoding.UTF8, "application/json");

            await _retryPolicy.ExecuteAsync(async _ =>
            {
                var response = await client.PostAsync(_rfqsUri, body, token);
                response.EnsureSuccessStatusCode();
            }, 
            token);
        }
    }
}
