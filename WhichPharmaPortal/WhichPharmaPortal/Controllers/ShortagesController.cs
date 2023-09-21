using System;
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
using WhichPharma.Services.Shortages;
using WhichPharma.Utils.Exceptions;

namespace WhichPharmaPortal.Controllers
{
    /// <summary>
    /// Shortages information
    /// </summary>
    [Authorize(Roles = Roles.AllExceptExternal)]
    [ApiController]
    [Route("v1/shortages")]
    [Produces("application/json")]
    [ProducesErrorResponseType(typeof(void))]
    public class ShortagesController : ControllerBase
    {
        private readonly ILogger<ShortagesController> _logger;
        private readonly IShortagesService _shortagesService;

        /// <summary>
        /// Shortages controller
        /// </summary>
        public ShortagesController(
            ILogger<ShortagesController> logger, 
            IShortagesService shortagesService)
        {
            _logger = logger;
            _shortagesService = shortagesService;
        }

        /// <summary>
        /// Get shortages from RBPharma database
        /// </summary>
        /// <param name="offset">Number of shortages skiped</param>
        /// <param name="pageSize">Maximum number of shortages to be returned (100 is used when omitted)</param>
        /// <param name="filters">Query filters</param>
        /// <param name="token">Cancellation token</param>
        /// <returns>Returns the list of shortages</returns>
        /// <response code="200">Success - Returns the list of shortages</response>
        /// <response code="400">BadRequest - Invalid query values</response> 
        /// <response code="401">Unauthorized - Authorization token invalid or expired</response>            
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(SearchResult<ProductV1>))]
        public async Task<ActionResult<SearchResult<ShortageInfo>>> Get(
            [FromQuery] int? offset,
            [FromQuery] int? pageSize,
            [FromQuery] GetShortagesFilters filters,
            CancellationToken token)
        {
            try
            {
                var res = await _shortagesService.GetShortagesAsync(filters, offset ?? 0, pageSize ?? 100, token);

                _logger.LogDebug("Shortages loaded", new
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
    }
}
