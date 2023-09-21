using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Models.Products;
using WhichPharma.StandardTerms.Models;
using WhichPharma.Utils.Extensions;

namespace WhichPharma.StandardTerms
{
    public class StandardTermsClient : IStandardTermsClient
    {
        private const string TERMS_IDS_MAP_CACHE_KEY = "StandardTermsClient.TermsIdsMap";

        private const string KEY = "rhEQvq5D";
        private const string LOGIN = "fabio.cardoso@rbpharma.pt";
        //private const string HOST = "62.28.94.47";
        private const string HOST = "standardterms.edqm.eu";
        public const string TERMS_URI = "https://standardterms.edqm.eu:443/standardterms/api/v1/terms/{0}/1/1/1?min=2";
        private const string ENGLISH_LANGUAGE = "en";

        private readonly IMemoryCache _cache;
        private readonly HttpClient _client;

        public StandardTermsClient(IMemoryCache cache, HttpClient client)
        {
            _cache = cache;
            _client = client;
        }

        private static string GetSignature(string date, string verb, string uri)
        {
            var message = verb + "&" + uri + "&" + HOST + "&" + date;

            byte[] keyByte = System.Text.Encoding.ASCII.GetBytes(KEY);
            byte[] messageBytes = System.Text.Encoding.ASCII.GetBytes(message);
            using (var sha = new HMACSHA512(keyByte))
            {
                byte[] hashmessage = sha.ComputeHash(messageBytes);
                var base64 = Convert.ToBase64String(hashmessage);
                return base64.Substring(base64.Length-22, 22);
            }
        }

        private static HttpRequestMessage GetRequest(Uri uri)
        {
            var date = DateTime.UtcNow.ToString("r");
            var request = new HttpRequestMessage(HttpMethod.Get, uri);

            var authorization = LOGIN + "|" + GetSignature(date, "GET", uri.AbsolutePath);

            request.Headers.Add("X-STAPI-KEY", authorization);
            request.Headers.Add("Date", date);

            return request;
        }

        protected async Task<Result<IDictionary<string, string>>> GetTermsAsync(string language, CancellationToken token)
        {
            var uri = new Uri(string.Format(TERMS_URI, language));
            var result = await _client.SendAsync(GetRequest(uri), token);

            result.EnsureSuccessStatusCode();

            var json = await result.Content.ReadAsStringAsync();
            var content = JsonSerializer.Deserialize<Result<IDictionary<string, string>>>(json);

            return content;
        }

        protected Task<TermsMappings> GetTermsIdsMappingAsync(CancellationToken token)
        {
            return _cache.GetOrCreateAsync(TERMS_IDS_MAP_CACHE_KEY, async _ =>
            {
                var pharmaceuticalFormEnglishTerms = Enum.GetValues(typeof(PharmaceuticalForm)).Cast<PharmaceuticalForm>().ToDictionary(
                    form => Enum.GetName(typeof(PharmaceuticalForm), form)
                        .CamelCaseToPretty()
                        .Replace(" Or ", "/")
                        .ToLowerInvariant(),
                    form => form);

                var administrationEnglishTerms = Enum.GetValues(typeof(Administration)).Cast<Administration>().SelectMany(
                    administration =>
                    {
                        var formatted = Enum.GetName(typeof(Administration), administration)
                            .CamelCaseToPretty()
                            .Replace(" Or ", "/")
                            .ToLowerInvariant();

                        return new[]
                        {
                        (Key: formatted, Value: administration),
                        (Key: formatted + " use", Value: administration),
                        (Key: formatted + " (unspecified)", Value: administration),
                        (Key: formatted + " (unprocessed)", Value: administration),
                        };
                    })
                    .ToDictionary(p => p.Key, p => p.Value);

                var response = await GetTermsAsync(ENGLISH_LANGUAGE, token);
                
                var result = response.Content.First();

                var ret = new TermsMappings();

                foreach (var term in result)
                {
                    var value = term.Value.ToLowerInvariant();

                    if (administrationEnglishTerms.TryGetValue(value, out var administration))
                    {
                        ret.AdministrationMap[administration].Add(term.Key.Substring(0, term.Key.IndexOfNth('-', 0, 2)));
                    }
                    else if (pharmaceuticalFormEnglishTerms.TryGetValue(value, out var form))
                    {
                        ret.PharmaceuticalFormMap[form].Add(term.Key.Substring(0, term.Key.IndexOfNth('-', 0, 2)));
                    }
                }

                return ret;
            });
        }

        public async Task<TermsMappings> GetTranslationsAsync(string language, CancellationToken token)
        {
            var ids = await GetTermsIdsMappingAsync(token);

            var result = (await GetTermsAsync(language, token)).Content.FirstOrDefault()
                .ToDictionary(p => p.Key.Substring(0, p.Key.IndexOfNth('-', 0, 2)), p => p.Value);

            return new TermsMappings
            {
                AdministrationMap = ids.AdministrationMap.ToDictionary(
                    p => p.Key,
                    p => p.Value
                        .Select(id => result.TryGetValue(id, out string translation) ? translation : null)
                        .Where(translation => translation != null && translation != "-")
                        .Select(translation => translation.ToLower())
                        .Distinct()
                        .ToList() as IList<string>),

                PharmaceuticalFormMap = ids.PharmaceuticalFormMap.ToDictionary(
                    p => p.Key,
                    p => p.Value
                        .Select(id => result.TryGetValue(id, out string translation) ? translation : null)
                        .Where(translation => translation != null && translation != "-")
                        .Select(translation => translation.ToLower())
                        .Distinct()
                        .ToList() as IList<string>),
            };
        }
    }
}
