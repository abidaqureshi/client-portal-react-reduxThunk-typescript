using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WhichPharmaPortal.Models.Client;
using WhichPharma.Services.Identity;
using WhichPharma.Services.RFQs;
using WhichPharmaPortal.Extensions;
using WhichPharmaPortal.Models.Server;
using WhichPharma.Services.Products;
using Microsoft.Extensions.Caching.Memory;
using WhichPharma.Services.Suppliers;
using System;
using WhichPharma.Models.Server;
using System.ComponentModel.DataAnnotations;
using System.Net.Http;
using HtmlAgilityPack;
using System.Globalization;

namespace WhichPharmaPortal.Controllers
{
    /// <summary>
    /// Suppliers management for External roles
    /// </summary>
    [Authorize(Roles = Roles.External)]
    [ApiController]
    [Route("v1/external")]
    [Produces("application/json")]
    [ProducesErrorResponseType(typeof(void))]
    public class SuppliersExternalController : ControllerBase
    {
        private const int PRODUCTS_SEARCH_MAX_RESULTS = 100;

        private readonly ILogger<SuppliersController> _logger;
        private readonly IRFQService _rfqService;

        /// <summary>
        /// Suppliers controller
        /// </summary>
        public SuppliersExternalController(
            ILogger<SuppliersController> logger, 
            IRFQService rfqService)
        {
            _logger = logger;
            _rfqService = rfqService;
        }

        /// <summary>
        /// Get supplier table data rows for the given RFQs.
        /// <para>Supplier ID is gotten from the authorization token.</para>
        /// </summary>
        /// <param name="rfqsNumbers">RFQs numbers</param>
        /// <param name="token">Cancellation token</param>
        /// <response code="200">Successfully get table data rows</response>
        /// <response code="400">The supplier ID in the authorization token has no entry in the given RFQs numbers.</response>
        [HttpGet("rfqs/data")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<RFQSupplierDetails>> GetRFQsSupplierData([FromQuery] string rfqsNumbers, CancellationToken token)
        {
            var supplierId = User.GetUserIdentifier();
            var email = User.GetUserEmail();
            var client = new HttpClient();
            client.Timeout = TimeSpan.FromMinutes(3);
            var responseCAD = await client.GetAsync("https://wise.com/gb/currency-converter/cad-to-eur-rate?amount=41");
            var responseUSD = await client.GetAsync("https://wise.com/gb/currency-converter/usd-to-eur-rate?amount=91");
            var bodyCAD = await responseCAD.Content.ReadAsStringAsync();
            var bodyUSD = await responseUSD.Content.ReadAsStringAsync();
            var pageCAD = new HtmlDocument();
            pageCAD.LoadHtml(bodyCAD);
            var pageUSD = new HtmlDocument();
            pageUSD.LoadHtml(bodyUSD);
            decimal.TryParse(pageCAD.DocumentNode.SelectSingleNode("//span[contains(@class, 'text-success')]")?.InnerText, NumberStyles.Any, CultureInfo.InvariantCulture, out var rateCAD);
            decimal.TryParse(pageUSD.DocumentNode.SelectSingleNode("//span[contains(@class, 'text-success')]")?.InnerText, NumberStyles.Any, CultureInfo.InvariantCulture, out var rateUSD);

            var rfqsDetails = string.IsNullOrWhiteSpace(rfqsNumbers)
                ? await _rfqService.GetSupplierRFQsDetailsAsync(supplierId, email, token)
                : await Task.WhenAll(rfqsNumbers
                    .Split(new char[] { ',' })
                    .Distinct()
                    .Select(rfqNumber => _rfqService.GetRFQDetailsAsync(rfqNumber,null,null, token)));

            var supplierTable = rfqsDetails.SelectMany(rfq => 
                rfq.SuppliersDetails
                    .Where(detail => detail.SupplierId == supplierId && detail.SupplierContactEmail == email) // Double-checking to avoid sending data from other supplier
                    .SelectMany(detail => detail.DataTable
                        .Where(row => row.RfqNr != null && (rfqsNumbers == null || rfqsNumbers.Contains(row.RfqNr)))
                        .Select(row => row.WithExtendedId()))
                    .OrderByDescending(row => row.CreationDate)
                ?? Enumerable.Empty<RFQQuoteInfo>());

            if (!supplierTable.Any())
            {
                return BadRequest();
            }

            var ret = rfqsDetails.First().SuppliersDetails.First(detail => detail.SupplierId == supplierId);

            ret.DataTable = supplierTable.Select(product => {
                if (product.ExwNetPriceEuro != null && product.Currency != null)
                {
                    if (product.Currency == "EUR")
                    {
                        product.PriceCurrencyToEuro = product.ExwNetPriceEuro;
                    }
                    else if (product.Currency == "CAD")
                    {
                        product.PriceCurrencyToEuro = (rateCAD * decimal.Parse(product.ExwNetPriceEuro, CultureInfo.InvariantCulture)).ToString();
                    }
                    else if (product.Currency == "USD")
                    {
                        product.PriceCurrencyToEuro = (rateUSD * decimal.Parse(product.ExwNetPriceEuro, CultureInfo.InvariantCulture)).ToString();
                    }
                }
                return product; 
            }).ToArray();

            return Ok(ret);
        }

        /// <summary>
        /// Update RFQs supplier table data rows.
        /// <para>Supplier ID is gotten from the authorization token.</para>
        /// </summary>
        /// <param name="data">Table data rows</param>
        /// <param name="token">Cancellation token</param>
        /// <response code="200">Table data rows updated</response>
        /// <response code="400">Table data rows have invalid data</response>
        [HttpPut("rfqs/data")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdateRFQsSupplierData(
            [FromBody] SupplierRFQQuotesChange data, string attachedFile,
            CancellationToken token)
        {
            var supplierId = User.GetUserIdentifier();
            var email = User.GetUserEmail();

            var dataByRfq = data.Quotes.GroupBy(row => row.RfqNr);

            var results = await Task.WhenAll(dataByRfq.Select(group => _rfqService.UpdateRFQSupplierTableDataAsync(
                rfqNumber: group.Key, 
                supplierId,
                supplierEmail: email,
                data: group.Select(row => row.WithCompressedId()).ToArray(),
                dueDate: data.Quotes.First().EndingDate.ToString(),
                sendEmailConfirmingChange: true,
           //     attachedFile,
                token)));

            if (results.All(result => result == RFQUpdateError.None))
            {
                return Ok();
            }
            else
            {
                return BadRequest();
            }
        }

        /// <summary>
        /// Get products
        /// </summary>
        /// <param name="search">Search filters</param>
        /// <param name="productsService">Products service</param>
        /// <param name="suppliersService">Suppliers service</param>
        /// <param name="cache">Memory Cache</param>
        /// <param name="token">Cancellation token</param>
        /// <response code="200">Products information</response>
        [HttpGet("products/search")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> SearchProducts(
            [FromQuery] SupplierProductsSearch search,
            [FromServices] IProductsService productsService,
            [FromServices] ISuppliersService suppliersService,
            [FromServices] IMemoryCache cache,
            CancellationToken token)
        {
            var supplierId = User.GetUserIdentifier();

            var supplier = await cache.GetOrCreateAsync("supplier-" + supplierId, entry =>
            {
                entry.SetSlidingExpiration(TimeSpan.FromHours(2));
                return suppliersService.GetSupplierAsync(supplierId);
            });

            var products = (await productsService.GetProductsAsync(
                new GetProductsFilters
                {
                    Name = search.Name,
                    Countries = supplier.CountryCode,
                }, 
                0, 
                PRODUCTS_SEARCH_MAX_RESULTS, 
                false,
                token)).Items as IEnumerable<ProductV2>;

            if(products.Count() < PRODUCTS_SEARCH_MAX_RESULTS)
            {
                var otherCountryProducts = (await productsService.GetProductsAsync(
                    new GetProductsFilters { Name = search.Name }, 
                    new GetProductsFilters { Countries = supplier.CountryCode }, 
                    0, 
                    PRODUCTS_SEARCH_MAX_RESULTS - products.Count(), 
                    false,
                    token)).Items;

                products = products.Concat(otherCountryProducts);
            }

            return Ok(products.Select(p => new ProductV2
            {
                Id = p.Id,
                Name = p.Name,
                ActiveSubstances = p.ActiveSubstances,
                ATC = p.ATC,
                Strength = p.Strength,
                PharmaceuticalForm = p.PharmaceuticalForm,
                AdministrationRoute = p.AdministrationRoute,
                Package = p.Package,
                CountryCode = p.CountryCode,
                CountryName = p.CountryName,
                MAHolder = p.MAHolder,
            }));
        }

        /// <summary>
        /// Get deprecated products
        /// </summary>
        /// <param name="search">Search filters</param>
        /// <param name="productsService">Products service</param>
        /// <param name="suppliersService">Suppliers service</param>
        /// <param name="cache">Memory Cache</param>
        /// <param name="token">Cancellation token</param>
        /// <response code="200">Products information</response>
        [HttpGet("productsV1/search")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> SearchProductsV1(
            [FromQuery] SupplierProductsSearch search,
            [FromServices] ILegacyProductsService productsService,
            [FromServices] ISuppliersService suppliersService,
            [FromServices] IMemoryCache cache,
            CancellationToken token)
        {
            var supplierId = User.GetUserIdentifier();

            var supplier = await cache.GetOrCreateAsync("supplier-" + supplierId, entry =>
            {
                entry.SetSlidingExpiration(TimeSpan.FromHours(2));
                return suppliersService.GetSupplierAsync(supplierId);
            });

            var products = (await productsService.GetProductsAsync(
                new GetLegacyProductsFilters
                {
                    Name = search.Name,
                    Countries = supplier.CountryCode,
                },
                0,
                PRODUCTS_SEARCH_MAX_RESULTS,
                token)).Items as IEnumerable<ProductV1>;

            if (products.Count() < PRODUCTS_SEARCH_MAX_RESULTS)
            {
                var otherCountryProducts = (await productsService.GetProductsAsync(
                    new GetLegacyProductsFilters { Name = search.Name },
                    new GetLegacyProductsFilters { Countries = supplier.CountryCode },
                    0,
                    PRODUCTS_SEARCH_MAX_RESULTS - products.Count(),
                    token)).Items;

                products = products.Concat(otherCountryProducts);
            }

            return Ok(products.Select(p => new ProductV2
            {
                Id = p.Id,
                ProductCode = p.ProductCode,
                Name = p.Name,
                ActiveSubstances = p.ActiveSubstances,
                ATC = p.ATC,
                Strength = p.Strength,
                PharmaceuticalForm = p.DrugForm,
                AdministrationRoute = p.AdministrationForm,
                Package = p.Package,
                CountryCode = p.CountryCode,
                CountryName = p.Country,
                MAHolder = p.MAHolder,
            }));
        }

        /// <summary>
        /// Get RBPharma collaborators
        /// </summary>
        /// <response code="200">Success - Returns the list of users</response>
        /// <response code="401">Unauthorized - Authorization token invalid or expired</response>         
        /// <response code="403">Forbidden - User has no roles with permission to access this endpoint</response>   
        [HttpGet("collaborators")]
        [Produces("application/json")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<User>))]
        public async Task<IEnumerable<User>> GetCollaborators([FromServices] IIdentityService identityService, CancellationToken token)
        {
            var result = (await identityService.GetAllUsersAsync(token))
                .Where(u => u.Roles.Contains(UserRole.Collaborator))
                .Select(u => new User
                {
                    Username = u.Username,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Roles = new[] { UserRole.Collaborator },
                    ImageUrl = u.ImageUrl,
                });

            _logger.LogDebug("Assignable users got for external supplier", new
            {
                Count = result.Count(),
            });

            return result;
        }
        /// <summary>
        /// Get RBPhama users responsible for the given RFQs from the authenticated Supplier.
        /// <para>Supplier ID is gotten from the authorization token.</para>
        /// </summary>
        /// <param name="rfqsNumbers">RFQs numbers</param>
        /// <param name="token">Cancellation token</param>
        /// <response code="200">Successfully get table data rows</response>
        /// <response code="400">The supplier ID in the authorization token has no entry in the given RFQs numbers.</response>
        [HttpGet("rfqs/responsibles")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<IDictionary<string, string>>> GetRFQsResponsibles([FromQuery][Required] string rfqsNumbers, CancellationToken token)
        {
            var supplierId = User.GetUserIdentifier();
            var email = User.GetUserEmail();

            var rfqsDetails = await Task.WhenAll(rfqsNumbers
                    .Split(new char[] { ',' })
                    .Select(rfqNumber => _rfqService.GetRFQDetailsAsync(rfqNumber,null,null, token)));

            var rfqsIdsFromTheSupplier = rfqsDetails
                .Where(detail => detail.SuppliersDetails.Any(row => row.SupplierContactEmail == email))
                .Select(detail => detail.RFQNumber)
                .Distinct();

            if (!rfqsIdsFromTheSupplier.Any())
            {
                return BadRequest();
            }

            var rfqs = await _rfqService.GetRFQSummariesAsync(rfqsIdsFromTheSupplier, token);

            return Ok(rfqs.ToDictionary(rfq => rfq.Number, rfq => rfq.AssigneeUsername));
        }
    }
}
