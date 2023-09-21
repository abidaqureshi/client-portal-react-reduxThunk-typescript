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

namespace WhichPharmaPortal.Controllers
{
    /// <summary>
    /// Products information
    /// </summary>
    [Authorize(Roles = Roles.AllExceptExternal)]
    [ApiController]
    [Route("v1/products")]
    [Produces("application/json")]
    [ProducesErrorResponseType(typeof(void))]
    public class LegacyProductsController : ControllerBase
    {
        private readonly ILogger<ProductsController> _logger;
        private readonly ILegacyProductsService _productsService;
        private readonly ILegacyProductSets _productSets;

        /// <summary>
        /// Products controller
        /// </summary>
        public LegacyProductsController(
            ILogger<ProductsController> logger, 
            ILegacyProductsService productsService,
            ILegacyProductSets productSets)
        {
            _logger = logger;
            _productsService = productsService;
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
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(SearchResult<ProductV1>))]
        public async Task<ActionResult<SearchResult<ProductV1>>> Get(
            [FromQuery] int? offset,
            [FromQuery] int? pageSize,
            [FromQuery] GetLegacyProductsFilters filters,
            CancellationToken token)
        {
            try
            {
                var res = await _productsService.GetProductsAsync(filters, offset ?? 0, pageSize ?? 100, token);

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
            catch(InvalidParameterException e)
            {
                var modelState = new ModelStateDictionary();
                modelState.AddModelError(e.ParamName, e.Message);
                return BadRequest(modelState);
            }
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
            .GetDrugFormsSet(token)
            .Select(res => res.IfEmpty(new string[] { "None" }).ToArray());

        /// <summary>
        /// List of all Administration Forms present in products Database
        /// </summary>
        /// <response code="200">Success - Returns the list of Drug Forms</response>
        /// <response code="401">Unauthorized - Authorization token invalid or expired</response>  
        [HttpGet("sets/administrationForms")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string[]))]
        public Task<string[]> GetAdministrationFormsSet(CancellationToken token) => _productSets
            .GetAdministrationFormsSet(token)
            .Select(res => res.IfEmpty(new string[] { "None" }).ToArray());

        /// <summary>
        /// List of all Product Status present in products Database
        /// </summary>
        /// <response code="200">Success - Returns the list of Product Status</response>
        /// <response code="401">Unauthorized - Authorization token invalid or expired</response>  
        [HttpGet("sets/statuses")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string[]))]
        public Task<string[]> GetStatusesSet(CancellationToken token) => _productSets
            .GetStatusesAsync(token)
            .Select(res => res.IfEmpty(new string[] { "None" }).ToArray());
    }
}
