using ArrayToExcel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Models.Products;
using WhichPharma.Models.Services;
using WhichPharma.Models.Worker;
using WhichPharma.Services.Email;
using WhichPharma.Services.Products;
using WhichPharma.Services.Scrappers;

namespace WhichPharmaPortal.Controllers
{
    /// <summary>
    /// Service controller
    /// </summary>
    [ApiController]
    [Route("v1/service")]
    [Produces("application/json")]
    [ProducesErrorResponseType(typeof(void))]
    public class ServiceController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly IScrapperService _scrapperService;
        private readonly IProductsService _productsService;
        private ILogger<ServiceController> _logger;
        /// <summary>
        /// Service controller
        /// </summary>
        public ServiceController(IEmailService emailService, IScrapperService scrrapperService, IProductsService productsService, ILogger<ServiceController> logger)
        {
            _emailService = emailService;
            _scrapperService = scrrapperService;
            _productsService = productsService;
            _logger = logger;
        }

        /// <summary>
        /// SendEmail Action
        /// </summary>
        [HttpPost("SendEmail")]
        public async Task<IActionResult> SendEmail([FromBody] Email email, CancellationToken token)
        {
            byte[] bytesAttachment = null;

            if (!string.IsNullOrEmpty(email.ExecutionId))
            {
#if DEBUG
                var host = "localhost:44394";
#else
                var host = "whichpharma.pt";
#endif

                var productsLoadTotal = await _scrapperService.GetProductsByCollection(email.ExecutionId, token);
                var productsAlteredLoad = await _scrapperService.GetProductsAlteredByExecutionId(email.ExecutionId, token);
                var execution = await _scrapperService.GetLogExecutionScrapper(email.ExecutionId, token);
                var currentProducts = await _productsService.GetProductsAsync(new WhichPharma.Models.Server.GetProductsFilters()
                {
                    Countries = execution.Country
                }, 0, 0, true, token);

                currentProducts
                    .Items.Where(x => !productsLoadTotal.Any(y => y.ScrapingOriginIdentifier == x.ScrapingOriginIdentifier))
                    .ToList()
                    .ForEach(x =>
                    {
                        productsAlteredLoad.Add(new LogExecutionScrapperProduct()
                        {
                            ExecutionId = email.ExecutionId,
                            Action = "Removed",
                            ProductIdentifier = x.ScrapingOriginIdentifier,
                            ScrapingOriginUrl = x.ScrapingOriginUrl,
                            Properties = null
                        });
                    });

                string body = "Job execution report: <br>" +
                 "<br>------------" +
                 "<br>Execution Time: " + GetTimeFromMiliseconds(email.TotalExecutionTime.Value) +
                 "<br>Previous load results: " + currentProducts.Total + " products" +
                 "<br>Current load total results: " + (productsLoadTotal?.Count() ?? 0).ToString() + " products" +
                 "<br>------------" +
                 "<br>Changes" +
                 "<br>New Products: " + (productsAlteredLoad?.Count(x => x.Action == "Added") ?? 0).ToString() +
                 "<br>Updated Products: " + (productsAlteredLoad?.Count(x => x.Action == "Updated") ?? 0).ToString() +
                 "<br>Removed Products: " + (productsAlteredLoad?.Count(x => x.Action == "Removed") ?? 0).ToString() +
                 "<br>------------" +
                 "<br>Next execution: " + email.NextExecution.ToString();

                if (productsAlteredLoad.Count > 0)
                {
                    body += $"<br><a href='https://{host}/v1/service/AproveOrDeclineScrapper?executionId={email.ExecutionId}&approved=true'>Accept?</a> " +
                            $"<br><a href='https://{host}/v1/service/AproveOrDeclineScrapper?executionId={email.ExecutionId}&approved=false'>Discharge?</a> ";
                }

                body += "<br><br>Resume changed properties: " +
                 "<br><table>";

                productsAlteredLoad?
                    .Where(x => x.Properties != null)
                    .SelectMany(x => x.Properties)
                    .GroupBy(x => x.Property)
                    .Select(x =>
                    {
                        return new
                        {
                            Prop = x.Key,
                            Qty = x.Count()
                        };
                    })
                    .OrderByDescending(x => x.Qty)
                    .ToList()
                    .ForEach(x =>
                    {
                        body += string.Format("<tr><td>{0}</td><td>{1}</td></tr>", x.Prop, x.Qty);
                    });

                body += "</table>";

                email.Body = body.ToString();
                _logger.LogInformation("Create Excell");
                bytesAttachment = (productsAlteredLoad?.Count ?? 0) > 0 ? ConvertDataTable(productsAlteredLoad.ToList()).ToExcel() : null;
                email.Subject = $"[{execution.ExecutionName} - Searching] {execution.ExecutionId} - Load successful. Waiting for next execution. Total products: {(productsLoadTotal?.Count() ?? 0)}";
            }

            var result = await _emailService.SendEmailFromWhichPharmaAccountThroughGoogleApiAsync(
                email.To?.Select(x => (x, x))?.ToList() ?? Enumerable.Empty<(string, string)>(),
                email.Cc?.Select(x => (x, x))?.ToList() ?? Enumerable.Empty<(string, string)>(),
                email.Subject,
                email.Body,
                (bytesAttachment, email.ExecutionId + ".xlsx"),
                token);

            if (string.IsNullOrEmpty(result)) return BadRequest();
            else return Ok();
        }

        private DataTable ConvertDataTable(List<LogExecutionScrapperProduct> productsAltered)
        {
            if (productsAltered == null ||
                (productsAltered != null && productsAltered.Count == 0)) return null;

            DataTable table = new DataTable();

            table.Columns.Add("Action");
            table.Columns.Add("ProductIdentifier");
            table.Columns.Add("ScrapingOriginUrl");
            table.Columns.Add("Property");
            table.Columns.Add("OldValue");
            table.Columns.Add("NewValue");

            string[] values = new string[6];
            foreach (LogExecutionScrapperProduct log in productsAltered)
            {
                
                values = new string[6];
                values[0] = log.Action;
                values[1] = log.ProductIdentifier;
                values[2] = log.ScrapingOriginUrl;

                if (log.Properties != null)
                {
                    foreach (LogExecutionScrapperProductProperty property in log.Properties)
                    {
                        values[3] = property.Property;
                        values[4] = GetValueObject(property.Property, property.OldValue);
                        values[5] = GetValueObject(property.Property, property.NewValue);

                        table.Rows.Add(values);
                    }
                }
                else
                {
                    table.Rows.Add(values);
                }
            }

            return table;
        }

        private string GetValueObject(string property, string value)
        {
            if (string.IsNullOrEmpty(property) || string.IsNullOrEmpty(value)) return value;

            if (property.Contains("Prices"))
            {
                try
                {
                    if (string.IsNullOrEmpty(value)) return value;

                    if (value.StartsWith("["))
                    {
                        var prices = Newtonsoft.Json.JsonConvert.DeserializeObject<IEnumerable<Price>>(value);
                        return prices.Count() == 0 ? null : String.Join(" - ", prices.Select(x => x.Value));
                    }

                    var price = Newtonsoft.Json.JsonConvert.DeserializeObject<Price>(value);
                    return price?.Value.ToString();
                }
                catch
                {
                    return null;
                }
            }

            if (property.Contains("Codes"))
            {
                try
                {
                    if (string.IsNullOrEmpty(value)) return value;

                    if (value.StartsWith("["))
                    {
                        var codes = Newtonsoft.Json.JsonConvert.DeserializeObject<IEnumerable<ProductCode>>(value);
                        return codes.Count() == 0 ? null : codes.FirstOrDefault().Value.ToString();
                    }

                    var code = Newtonsoft.Json.JsonConvert.DeserializeObject<ProductCode>(value);
                    return code.Type + " - " + code.Value.ToString();
                }
                catch
                {
                    return null;
                }
            }

            if (property.Contains("PharmaceuticalFormCategories"))
            {
                try
                {
                    var values = value?.Replace("[", "")?.Replace("]", "")?.Split(",").Where(x => !string.IsNullOrEmpty(x));
                    if (values != null && values.Any())
                    {
                        var descriptions = values.Select(x =>
                        {
                            return ((PharmaceuticalForm)Enum.Parse(typeof(PharmaceuticalForm), x)).ToString();
                        });
                        return string.Join(", ", descriptions);
                    }

                    return value;
                }
                catch
                {
                    return null;
                }
            }

            return value;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="executionId"></param>
        /// <param name="approved"></param>
        /// <param name="token"></param>
        /// <returns></returns>
        [HttpGet("AproveOrDeclineScrapper")]
        public async Task<IActionResult> AproveOrDeclineScrapper(string executionId, bool approved, CancellationToken token)
        {
            try
            {
                await _scrapperService.ApprovedOrDeclinedExecutionScrapper(executionId, approved, token);
                return Ok("Success");
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        private string GetTimeFromMiliseconds(double ms)
        {
            TimeSpan t = TimeSpan.FromMilliseconds(ms);
            return string.Format("{0:D2}h:{1:D2}m:{2:D2}s:{3:D3}ms",
                        t.Hours,
                        t.Minutes,
                        t.Seconds,
                        t.Milliseconds);
        }
    }
}
