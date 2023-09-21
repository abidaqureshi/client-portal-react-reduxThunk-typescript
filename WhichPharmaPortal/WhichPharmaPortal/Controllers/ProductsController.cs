using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Extensions.Logging;
using WhichPharmaPortal.Models.Client;
using WhichPharma.Models.Server;
using WhichPharma.Services.Identity;
using WhichPharma.Services.Products;
using WhichPharma.Utils.Exceptions;
using WhichPharma.Utils.Extensions;
using System.IO;
using System;
using System.Net.Http;
using HtmlAgilityPack;
using System.Globalization;
using System.Collections.Generic;

namespace WhichPharmaPortal.Controllers
{
    /// <summary>
    /// Products information
    /// </summary>
    [Authorize(Roles = Roles.AllExceptExternal)]
    [ApiController]
    [Route("v2/products")]
    [Produces("application/json")]
    [ProducesErrorResponseType(typeof(void))]
    public class ProductsController : ControllerBase
    {
        private readonly ILogger<ProductsController> _logger;
        private readonly IProductsService _productsService;
        private readonly IProductDocumentService _productDocumentService;
        private readonly IProductSets _productSets;
        private HttpClient client = new HttpClient();
        /// <summary>
        /// Products controller
        /// </summary>
        public ProductsController(
            ILogger<ProductsController> logger,
            IProductsService productsService,
            IProductDocumentService productDocumentService,
            IProductSets productSets)
        {
            _logger = logger;
            _productsService = productsService;
            _productDocumentService = productDocumentService;
            _productSets = productSets;
            
        }

        /// <summary>
        /// Get products from RBPharma database
        /// </summary>
        /// <param name="offset">Number of products skiped</param>
        /// <param name="pageSize">Maximum number of products to be returned (100 is used when omitted)</param>
        /// <param name="filters">Query filters</param>
        /// <param name="token">Cancellation token</param>
        /// <returns>Returns the list of products</returns>
        /// <response code="200">Success - Returns the list of products</response>
        /// <response code="400">BadRequest - Invalid query values</response> 
        /// <response code="401">Unauthorized - Authorization token invalid or expired</response>            
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(SearchResult<ProductV2>))]
        public async Task<ActionResult<SearchResult<ProductV2>>> Get(
            [FromQuery] int? offset,
            [FromQuery] int? pageSize,
            [FromQuery] GetProductsFilters filters,
            CancellationToken token)
        {
            try
            {
                if (filters.NotCommercialized != null && filters.NotCommercialized=="yes")
                {
                    filters.IsAuthorised = "no";
                    filters.IsMarketed = "no";
                }
                else 
                {
                    filters.IsAuthorised=null;
                    filters.IsMarketed= null;
                }

                var res = await _productsService.GetProductsAsync(filters, offset ?? 0, pageSize ?? 100,false,token);

                var rates = res.Items.Select(I => I.Prices?.Select(I => I.CurrencyCode)??Enumerable.Empty<string>()).SelectMany(I => I).Distinct();
                var dicRates = new Dictionary<string,decimal>();
                if (rates!=null || rates.Any())
                {

                    foreach (var I in rates)
                    {
                        var url = "https://wise.com/gb/currency-converter/" + I.ToLower() + "-to-eur-rate?amount=01";
                        var response = await client.GetAsync(url);
                        var body = await response.Content.ReadAsStringAsync();
                        var page = new HtmlDocument();
                        page.LoadHtml(body);
                        var x = page.DocumentNode.SelectSingleNode("//span[contains(@class, 'text-success')]")?.InnerText;
                        if (decimal.TryParse(x, System.Globalization.NumberStyles.Any, CultureInfo.GetCultureInfo("en-GB"), out var r))
                        {
                            dicRates.TryAdd(I, r);
                           
                        }
                        dicRates.TryAdd(I, -1);
                    }
                }


                res.Items = res.Items.Select(x => {
                    x.PharmaceuticalFormCategories = x.PharmaceuticalFormCategories?.Select(i => i.Replace('_', ' ').Replace('1', '+').Replace('2', ',').Replace('3', '/').Replace('4', '-'));
                    x.AdministrationCategories = x.AdministrationCategories?.Select(i => i.Replace('_', ' ').Replace('1', '+').Replace('2', ',').Replace('3', '/').Replace('4', '-'));                    
                    x.ShortageInfo = x.ShortageInfo != null && x.ShortageInfo.End.HasValue && x.ShortageInfo.End.Value < DateTime.Now ? null : x.ShortageInfo;                
                    //x.ShortageInfo = x.ShortageInfo != null && x.ShortageInfo.Start > DateTime.Now ? null : x.ShortageInfo;
                    if (x.Prices != null && x.Prices.Any(I => I.CurrencyCode.ToUpper() != "EUR"))
                    {
                        var newConversion = new List<Price>();
                        foreach (var item in x.Prices)
                        {
                            var rate = dicRates.GetValueOrDefault(item.CurrencyCode);
                            if (item.CurrencyCode.ToUpper() == "EUR")
                            {
                                continue;
                            }
                            if (rate != -1)
                            {
                                newConversion.Add(new Price
                                {
                                    IncludeVAT = item.IncludeVAT,
                                    CurrencyCode = "EUR",
                                    Type = item.Type,
                                    Value = item.Value * rate
                                });


                            }
                            newConversion.Add(new Price
                            {
                                IncludeVAT = item.IncludeVAT,
                                CurrencyCode = item.CurrencyCode,
                                Type = item.Type,
                                Value = item.Value
                            });
                        }
                        x.Prices = newConversion.Any(I => I.CurrencyCode == "EUR") ? newConversion : x.Prices;
                    }
                    x.ActiveSubstances = x.ActiveSubstances!=null && x.ActiveSubstances.Any(I => I == "Homeopathic preparations") ? new string[] { "Homeopathic preparations" } : x.ActiveSubstances;
                    return x;


                    }).ToList();
                _logger.LogDebug("Products loaded", new
                {
                    Filters = filters,
                    Offset = offset,
                    PageSize = pageSize,
                    ResultCount = res.Items.Count(),
                    res.Total,
                });
                
                
                return Ok(res);
            }
            catch (InvalidParameterException e)
            {
                var modelState = new ModelStateDictionary();
                modelState.AddModelError(e.ParamName, e.Message);
                return BadRequest(modelState);
            }
        }


        [HttpGet("sets/backups")]
        [Produces("application/json")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string[]))]
        public async Task<string[]> GetBackupList(CancellationToken token)
        {
            var dir = "C:\\RBPharmaPlatform\\Data\\Platform";

            var r = Directory.GetDirectories(dir).Select(I => I.Split("\\").LastOrDefault());

            return r.ToArray();

        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="token"></param>
        /// <returns></returns>
        [HttpGet("sets/additionalInformation")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string[]))]
        public async Task<string[]> GetAdditionalInformation(CancellationToken token)
        {
            await Task.CompletedTask;
            
            return new[] {
                "Generic",
                "Controled Drug",
                "Biological", 
                "Additional Monitoring",
                "Prescription",
                "Hospitalar",
                //"Precautions For Storage",
                "Parallel Import",
            };
        }

        /// <summary>
        /// List of all Countries present in products Database
        /// </summary>
        /// <response code="200">Success - Returns the list of Countries</response>
        /// <response code="401">Unauthorized - Authorization token invalid or expired</response>  
        [HttpGet("sets/countries")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Country[]))]
        public Task<Country[]> GetCountriesSet(CancellationToken token) => _productSets
            .GetCountriesAsync(token)
            .Select(res => res.IfEmpty(new Country[] { new Country { Alpha2Code = "PT", Name = "Portugal" } }).ToArray());

        /// <summary>
        /// List of all Origins present in products Database
        /// </summary>
        /// <response code="200">Success - Returns the list of Origins</response>
        /// <response code="401">Unauthorized - Authorization token invalid or expired</response>  
        [HttpGet("sets/origins")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string[]))]
        public Task<string[]> GetOriginsSet(CancellationToken token) => _productSets
            .GetOriginsAsync(token)
            .Select(res => res.IfEmpty(new string[] { "None" }).ToArray());

        /// <summary>
        /// List of all ATC codes present in products Database
        /// </summary>
        /// <response code="200">Success - Returns the list of ATC codes</response>
        [HttpGet("sets/atcs")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string[]))]
        public Task<string[]> GetAtcsSet(CancellationToken token) => _productSets
            .GetATCsAsync(token)
            .Select(res => res.IfEmpty(new string[] { "None" }).ToArray());

        /// <summary>
        /// List of all Active Substances present in products Database
        /// </summary>
        /// <response code="200">Success - Returns the list of Active Substances</response>
        /// <response code="401">Unauthorized - Authorization token invalid or expired</response>  
        [HttpGet("sets/activeSubstances")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string[]))]
        public Task<string[]> GetActiveSubstancesSet(CancellationToken token) => _productSets
            .GetActiveSubstancesAsync(token)
            .Select(res => res.IfEmpty(new string[] { "None" }).ToArray());

        /// <summary>
        /// List of all Drug Forms present in products Database
        /// </summary>
        /// <response code="200">Success - Returns the list of Drug Forms</response>
        /// <response code="401">Unauthorized - Authorization token invalid or expired</response>  
        [HttpGet("sets/drugForms")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string[]))]
        public Task<string[]> GetFormsSet(CancellationToken token) => _productSets
            .GetPharmaceuticalFormCategoriesAsync(token)
            .Select(res => res.IfEmpty(new string[] { "None" }).ToArray());

        /// <summary>
        /// List of all Administration Forms present in products Database
        /// </summary>
        /// <response code="200">Success - Returns the list of Drug Forms</response>
        /// <response code="401">Unauthorized - Authorization token invalid or expired</response>  
        [HttpGet("sets/administrationForms")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string[]))]
        public Task<string[]> GetAdministrationFormsSet(CancellationToken token) => _productSets
            .GetAdministrationCategoriesAsync(token)
            .Select(res => res.IfEmpty(new string[] { "None" }).ToArray());

        /// <summary>
        /// Get the document associated to product, document type and country
        /// <param name="productCode">Product Id</param>
        /// <param name="documentType">Document Type</param>
        /// <param name="country">Country</param>
        /// </summary>
        /// <response code="200">Return the document</response>
        /// <response code="404">Notfound - Documento not found</response>
        /// <response code="401">Unauthorized - Authorization token invalid or expired</response>
        [HttpGet("getDocument/{productCode}/{documentType}/{country}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [AllowAnonymous]
        public async Task<IActionResult> GetDocumentByProduct(
            [FromRoute] string productCode,
            [FromRoute] string documentType,
            [FromRoute] string country,
            CancellationToken token)
        {
            MemoryStream ms = await _productDocumentService.GetProductDocumentAsync(productCode, documentType, country, token);
            if (ms == null)
            {
                return NotFound();
            }
            return new FileStreamResult(ms, "application/pdf");
        }
    }
}
