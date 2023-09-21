using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System;
using Moq.Protected;
using System.Net;

namespace WhichPharma.StreakIntegration.Tests
{
    [TestClass()]
    public class StreakIntegrationClientTests
    {
        private string baseUri = "http://uribase";
        private CancellationToken token;
        private Mock<HttpMessageHandler> httpMsgHandler;
        private StreakIntegrationClient client;

        [TestInitialize]
        public void PrepareTest()
        {
            token = new CancellationTokenSource().Token;
            httpMsgHandler = new Mock<HttpMessageHandler>(MockBehavior.Strict);

            var logger = new Mock<ILogger<StreakIntegrationClient>>(MockBehavior.Loose).Object;
            var config = new Mock<IStreakIntegrationClientConfig>(MockBehavior.Strict);
            var httpFactory = new Mock<IHttpClientFactory>(MockBehavior.Strict);

            var httpClient = new HttpClient(httpMsgHandler.Object);
            httpFactory.Setup(f => f.CreateClient(It.IsAny<string>())).Returns(httpClient);

            config.Setup(c => c.ApiBaseUrl).Returns(baseUri);

            client = new StreakIntegrationClient(logger, config.Object, httpFactory.Object);
        }

        [TestMethod()]
        public async Task CreateRFQ_WhenExternalRequestFails_ShouldRetry3Times()
        {
            // Arrange

            httpMsgHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>("SendAsync", ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage(System.Net.HttpStatusCode.InternalServerError))
                .Verifiable();

            // Act

            try
            {
                await client.CreateRFQ("streakapikey", "rfqnr", "name", "assignemail", new string[] { "thread1", "thread2" }, token);
            }
            catch (Exception) { }

            // Assert

            httpMsgHandler
                .Protected()
                .Verify("SendAsync", Times.Exactly(4), ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>());
        }

        [TestMethod()]
        public async Task CreateRFQ_WhenExternalRequestThrows_ShouldRetry3Times()
        {
            // Arrange

            httpMsgHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>("SendAsync", ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>())
                .ThrowsAsync(new InternalTestFailureException())
                .Verifiable();

            // Act

            try
            {
                await client.CreateRFQ("streakapikey", "rfqnr", "name", "assignemail", new string[] { "thread1", "thread2" }, token);
            }
            catch (Exception) { }

            // Assert

            httpMsgHandler
                .Protected()
                .Verify("SendAsync", Times.Exactly(4), ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>());
        }

        [TestMethod()]
        public async Task CreateRFQ_WhenExternalRequestSucceed_ShouldDoJust1Call()
        {
            // Arrange

            httpMsgHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>("SendAsync", ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.OK))
                .Verifiable();

            // Act

            await client.CreateRFQ("streakapikey", "rfqnr", "name", "assignemail", new string[] { "thread1", "thread2" }, token);

            // Assert

            httpMsgHandler
                .Protected()
                .Verify("SendAsync", Times.Once(), ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>());
        }
    }
}