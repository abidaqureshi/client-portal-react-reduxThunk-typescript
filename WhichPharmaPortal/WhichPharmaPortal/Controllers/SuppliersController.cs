using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WhichPharmaPortal.Models.Client;
using WhichPharma.Models.Server;
using WhichPharma.Services.Identity;
using WhichPharma.Services.RFQs;
using WhichPharma.Services.Suppliers;
using WhichPharma.Utils.Exceptions;

namespace WhichPharmaPortal.Controllers
{
    /// <summary>
    /// Suppliers management (Administrator or Collaborator roles required)
    /// </summary>
    [Authorize(Roles = Roles.AdministratorOrCollaborator)]
    [ApiController]
    [Route("v1/suppliers")]
    [Produces("application/json")]
    [ProducesErrorResponseType(typeof(void))]
    public class SuppliersController : ControllerBase
    {
        private readonly ILogger<SuppliersController> _logger;
        private readonly ISuppliersService _suppliersService;
        private readonly IRFQService _rfqService;

        /// <summary>
        /// Suppliers controller
        /// </summary>
        public SuppliersController(
            ILogger<SuppliersController> logger, 
            ISuppliersService suppliersService,
            IRFQService rfqService)
        {
            _logger = logger;
            _suppliersService = suppliersService;
            _rfqService = rfqService;
        }

        /// <summary>
        /// Get Suppliers data from RBPharma database. Administrator or Collaborator roles required
        /// </summary>
        /// <param name="offset">Number of suppliers skiped</param>
        /// <param name="pageSize">Maximum number of suppliers to be returned</param>
        /// <param name="filters">Query filters</param>
        /// <param name="token">Cancellation Token</param>
        /// <response code="200">Success - Returns the suppliers data</response>
        /// <response code="403">Forbidden - User has no roles with permission to access this endpoint</response>   
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(SearchResult<Supplier>))]
        public async Task<ActionResult<SearchResult<Supplier>>> Get(
            [FromQuery] int? offset,
            [FromQuery] int? pageSize,
            [FromQuery] GetSuppliersFilters filters,
            CancellationToken token)
        {
            try
            {
                var res = await _suppliersService.GetSuppliersAsync(filters, offset ?? 0, pageSize ?? 100, token);

                _logger.LogDebug("Suppliers loaded", new
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
    }
}
