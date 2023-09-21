using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Database.Services;
using WhichPharma.Models.Database.Products;
using WhichPharma.Models.Worker;
using WhichPharma.Services.Email;

namespace WhichPharma.Services.Scrappers
{
    public class ScrapperService : IScrapperService
    {
        private IScrapperStorage _scrapperStorage;
        private IProductsStorage _productsStorage;
        private readonly IEmailService _emailService;

        public ScrapperService(IScrapperStorage scrapperStorage, IProductsStorage productsStorage, IEmailService emailService)
        {
            _scrapperStorage = scrapperStorage;
            _productsStorage = productsStorage;
            _emailService = emailService;
        }

        public async Task ApprovedOrDeclinedExecutionScrapper(string executionId, bool approved, CancellationToken token = default)
        {
            LogExecutionScrapper execution = null;

            try
            {
                execution = await _scrapperStorage.GetLogExeuctionScrapperAsync(executionId, token);

                if (execution == null) throw new ApplicationException("Execution scrapper not found");

                if (execution.IsVerified) throw new ApplicationException("Scrapper already verified");

                if (approved)
                {
                    var productsCollection = await _scrapperStorage.GetProductsByCollection(execution.ExecutionId, token);
                    var currentProducts = await _productsStorage.GetProductsAsync(new Database.Filters.ProductsFilter()
                    {
                        Countries = new List<string>() { execution.Country }
                    }, 0, 0, true, token);


                    (await _scrapperStorage.GetProductsAlteredByExecutionId(executionId, token)).Select(x => x.ProductIdentifier)
                        .ToList()
                        .ForEach(p =>
                        {
                            var product = productsCollection.FirstOrDefault(y => y.ScrapingOriginIdentifier == p);

                            if (product != null)
                            {
                                product.IsDeleted = false;
                                _productsStorage.UpdateProductAsync(executionId, product, true, token);
                            }
                        });

                    currentProducts
                        .Items.Where(x => !productsCollection.Any(y => y.ScrapingOriginIdentifier == x.ScrapingOriginIdentifier))
                        .ToList()
                        .ForEach(x =>
                        {
                            x.IsDeleted = true;
                            x.IsMarketed = false;
                            x.IsAuthorised = false;
                            x.LastUpdate = DateTime.Now;

                            _productsStorage.UpdateProductAsync(execution.ExecutionId, x, true, token);
                        });

                    SendEmail("Load successfully updated", $"[{execution.ExecutionName} - Searching] {execution.ExecutionId} - Load successfully updated", token);
                }
                else
                {
                    SendEmail("Load was rejected", $"[{execution.ExecutionName} - Searching] {execution.ExecutionId} - Load was rejected", token);
                }
                execution.IsVerified = true;
                execution.IsAprroved = approved;
                await _scrapperStorage.SetVerifiedLogExecution(executionId);
                await _scrapperStorage.RemoveCollection(execution.ExecutionId, token);
            }
            catch (Exception e)
            {
                SendEmail("Load failed to update. Details: " + e.Message, $"[{execution.ExecutionName} - Searching] {execution.ExecutionId} - Load failed to update", token);
                throw e;
            }
        }

        public async Task<LogExecutionScrapper> GetLogExecutionScrapper(string executionId, CancellationToken token = default)
        {
            return await _scrapperStorage.GetLogExeuctionScrapperAsync(executionId, token);
        }

        public async Task<List<LogExecutionScrapperProduct>> GetProductsAlteredByExecutionId(string executionId, CancellationToken token = default)
        {
            return await _scrapperStorage.GetProductsAlteredByExecutionId(executionId, token);
        }

        private async void SendEmail(string body, string subject, CancellationToken token)
        {
            List<string> emailsToSend = await _scrapperStorage.GetEmailsToSend(token);

            await _emailService.SendEmailFromWhichPharmaAccountThroughGoogleApiAsync(
                emailsToSend.Select(x => (x, x))?.ToList() ?? Enumerable.Empty<(string, string)>(),
                Enumerable.Empty<(string, string)>(),
                subject,
                body,
                token);
        }

        public async Task<List<Product>> GetProductsByCollection(string collectionName, CancellationToken token = default)
        {
            return await _scrapperStorage.GetProductsByCollection(collectionName, token);
        }
    }
}
