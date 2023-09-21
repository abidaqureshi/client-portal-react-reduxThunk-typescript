using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Microsoft.Extensions.Caching.Memory;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Moq.Protected;
using System.Net;
using System;
using Microsoft.Extensions.Options;
using WhichPharma.Models.Products;
using System.Linq;

namespace WhichPharma.StandardTerms.Tests
{
    [TestClass()]
    public class StandardTermsClientTests
    {
        [TestMethod()]
        public async Task GetTranslationsTest()
        {
            // Arrange

            var enUri = new Uri(string.Format(StandardTermsClient.TERMS_URI, "en"));
            var ptUri = new Uri(string.Format(StandardTermsClient.TERMS_URI, "pt"));

            var enResult = @"
{
    ""content"": [
        {
            ""AME-0004-EN-GB-2"": ""Chewing"",
            ""AME-0005-EN-GB-2"": ""Infusion"",
            ""AME-0015-EN-GB-2"": ""Rinsing/washing""
        }
    ]
}";

            var ptResult = @"
{
    ""content"": [
        {
            ""AME-0005-PT-PT-2"": ""Infusão"",
            ""AME-0015-PT-PT-2"": ""Lavagem"",
            ""AME-0030-PT-PT-2"": ""Outra coisa""
        }
    ]
}";

            var token = new CancellationTokenSource();
            var cacheOptions = new Mock<IOptions<MemoryCacheOptions>>();
            cacheOptions.Setup(o => o.Value).Returns(new MemoryCacheOptions { });
            var cache = new MemoryCache(cacheOptions.Object);

            var handlerMock = new Mock<HttpMessageHandler>(MockBehavior.Strict);

            handlerMock
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.Is<HttpRequestMessage>(request => request.RequestUri == enUri),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage()
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(enResult),
                });

            handlerMock
               .Protected()
               .Setup<Task<HttpResponseMessage>>(
                  "SendAsync",
                  ItExpr.Is<HttpRequestMessage>(request => request.RequestUri == ptUri),
                  ItExpr.IsAny<CancellationToken>()
               )
               .ReturnsAsync(new HttpResponseMessage()
               {
                   StatusCode = HttpStatusCode.OK,
                   Content = new StringContent(ptResult),
               });

            var httpClient = new HttpClient(handlerMock.Object);
        
            var client = new StandardTermsClient(cache, httpClient);

            // Act

            var res = await client.GetTranslationsAsync("pt", token.Token);

            // Assert

            Assert.AreEqual(res.AdministrationMap[Administration.Infusion].First(), "infusão");
            Assert.AreEqual(res.AdministrationMap[Administration.RinsingOrWashing].First(), "lavagem");
        }
    }
}