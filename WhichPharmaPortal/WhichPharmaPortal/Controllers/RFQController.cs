using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using WhichPharmaPortal.Models.Client;
using WhichPharma.Services.Identity;
using WhichPharma.Services.RFQs;
using WhichPharma.Services.RFQs.Exceptions;
using WhichPharmaPortal.Extensions;
using WhichPharma.Services.Products;
using System;
using System.Net.Http;
using HtmlAgilityPack;
using System.Globalization;
using System.Text.RegularExpressions;

namespace WhichPharmaPortal.Controllers
{
    /// <summary>
    /// RFQs controller (Administrator or Collaborator roles required)
    /// </summary>
    [Authorize(Roles = Roles.AdministratorOrCollaborator)]
    [ApiController]
    [Route("v1/rfqs")]
    [Produces("application/json")]
    [ProducesErrorResponseType(typeof(void))]
    public class RFQController : ControllerBase
    {
        private readonly ILogger<RFQController> _logger;
        private readonly IRFQService _rfqService;
        private readonly IProductsService _productsService;

        /// <summary>
        /// RFQs controller
        /// </summary>
        public RFQController(
            ILogger<RFQController> logger,
            IProductsService productsService,

            IRFQService rfqService)
        {
            _logger = logger;
            _rfqService = rfqService;
            _productsService = productsService;
        }

        /// <summary>
        /// Create RFQs and send the corresponding e-mails
        /// </summary>
        /// <response code="200">RFQs successfully created</response>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<ResultHandler<CreateRFQResult>>> CreateRFQ([FromBody] RFQRequest rfqRequest, CancellationToken token)
        {
            try
            {
                var x =  Request?.Host.Port!=null && Request.Host.Port == 50010 ; // 44394 
                if (x)
                {
                    rfqRequest.EmailsData = rfqRequest.EmailsData.Select(I => { I.Subject = I.Subject.Replace("RFQ", "RFQ Dev"); return I; }).ToList();
                }
                return Ok(new ResultHandler<CreateRFQResult>
                {
                    Result = await _rfqService.CreateRFQsAsync(User.GetUsername(), rfqRequest, token),
                });
            }
            catch(RFQCreationException e)
            {
                return BadRequest(new { e.Error });
            }
        }

        /// <summary>
        /// Get RFQs summary
        /// </summary>
        /// <param name="onlyMine">Set "true" to get only RFQs assigned to you</param>
        /// <param name="search">Search by term</param>
        /// <param name="expiredIn">Search by expiration Date</param>
        /// <param name="createdBy">Search by user Created</param>
        /// <param name="offset">Number of results skiped</param>
        /// <param name="pageSize">Maximum number of results to be returned (10 is used when omitted)</param>
        /// <param name="token">Cancellation token</param>
        /// <response code="200">RFQs summaries</response>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<SearchResult<RFQSummary>>> GetRFQs(
            [FromQuery] bool? onlyMine,
            [FromQuery] string search,
            [FromQuery] string expiredIn,
            [FromQuery] string createdBy,
            [FromQuery] int? offset,
            [FromQuery] int? pageSize,
            CancellationToken token)
        {
            var res = await _rfqService.GetRFQSummariesAsync(
                onlyMine ?? false ? this.User.GetUsername() : null,
                search,
                offset ?? 0,
                pageSize ?? 10,
                token);
            var L = new List<RFQSummary>();
            //foreach (var item in res.Result)
            //{
            //    var details = await GetRFQDetails(item.Number, null, null, token);
            //    var X = ((OkObjectResult)details.Result).Value as RFQDetails;
            //    item.EndingDate = X.SuppliersDetails?.FirstOrDefault()?.DataTable?.FirstOrDefault()?.EndingDate;
            //    L.Add(item);

            //}
            //res.Result = L;

            if (expiredIn!=null)
            {

                var ex = HttpUtility.UrlDecode(expiredIn).Split(",");
                var l = new List<RFQSummary>();
                if (ex.Contains("0"))
                {
                    var l1 = res.Result.Where(I => I.EndingDate.HasValue && I.EndingDate.Value < DateTime.Now).ToList();
                    l.AddRange(l1);
                    
                }if (ex.Contains("30"))
                {

                    var l1 = res.Result.Where(I => I.EndingDate.HasValue && I.EndingDate.Value > DateTime.Now && I.EndingDate.Value <= DateTime.Now.AddMinutes(30));
                    l.AddRange(l1);
                }if (ex.Contains("6"))
                {
                    var l1 = res.Result.Where(I => I.EndingDate.HasValue && I.EndingDate.Value > DateTime.Now && I.EndingDate.Value <= DateTime.Now.AddHours(6));
                    l.AddRange(l1);
                }if (ex.Contains("24"))
                {
                    var l1 = res.Result.Where(I => I.EndingDate.HasValue && I.EndingDate.Value > DateTime.Now && I.EndingDate.Value <= DateTime.Now.AddHours(24));
                    l.AddRange(l1);
                }if ( ex.Contains("72"))
                {
                    var l1 = res.Result.Where(I => I.EndingDate.HasValue && I.EndingDate.Value > DateTime.Now && I.EndingDate.Value <= DateTime.Now.AddHours(72));
                    l.AddRange(l1);
                }if ( ex.Contains("120"))
                {
                    var l1 = res.Result.Where(I => I.EndingDate.HasValue && I.EndingDate.Value > DateTime.Now && I.EndingDate.Value <= DateTime.Now.AddHours(120));
                    l.AddRange(l1);
                }
                res.Result = l.Distinct().ToList();
            }
            
            if (createdBy != null)
            {
                var ex = HttpUtility.UrlDecode(createdBy).Split(",");
                res.Result = res.Result.Where(I=>ex.Any(J=>J==I.AssigneeUsername)).ToList();
            }
            return Ok(new SearchResult<RFQSummary>
            {
                Total = (int) res.Total,
                Items = res.Result.Where(I=>true).ToList(),
            });
        }

        /// <summary>
        /// Get RFQs details
        /// </summary>
        /// <param name="rfqNumbers">RFQ numbers to get details</param>
        /// <param name="token">Cancellation token</param>
        /// <response code="200">RFQs details</response>
        [HttpGet("details")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<RFQDetails>>> GetRFQsDetails(
            [FromQuery] string rfqNumbers,
            CancellationToken token)
        {
            /*            return Ok(string.IsNullOrWhiteSpace(rfqNumbers)
                            ? Enumerable.Empty<RFQDetails>()
                            : await _rfqService.GetRFQsDetailsAsync(rfqNumbers.Split(new char[] { ',' }), token));
            */
            //var r = await rfqNumbers.Split(',').Select(async I => await GetRFQDetails(I, null, null, token));
            if (string.IsNullOrWhiteSpace(rfqNumbers))
            {
                return Ok(Enumerable.Empty<RFQDetails>());
            }
            var client = new HttpClient();
            client.Timeout = TimeSpan.FromMinutes(3);
            var responseCAD = await client.GetAsync("https://wise.com/gb/currency-converter/cad-to-eur-rate?amount=31");
            var responseUSD = await client.GetAsync("https://wise.com/gb/currency-converter/usd-to-eur-rate?amount=51");
            var bodyCAD = await responseCAD.Content.ReadAsStringAsync();
            var bodyUSD = await responseUSD.Content.ReadAsStringAsync();
            var pageCAD = new HtmlDocument();
            pageCAD.LoadHtml(bodyCAD);
            var pageUSD = new HtmlDocument();
            pageUSD.LoadHtml(bodyUSD);
            decimal.TryParse(pageCAD.DocumentNode.SelectSingleNode("//span[contains(@class, 'text-success')]")?.InnerText ?? "60", NumberStyles.Any, CultureInfo.InvariantCulture, out var rateCAD);
            //decimal.TryParse("0.93670", NumberStyles.Any,CultureInfo.InvariantCulture,out  var rateUSD);
            decimal.TryParse(pageUSD.DocumentNode.SelectSingleNode("//span[contains(@class, 'text-success')]")?.InnerText ?? "70", NumberStyles.Any, CultureInfo.InvariantCulture, out var rateUSD);
            var r = (await _rfqService.GetRFQsDetailsAsync(rfqNumbers.Split(new char[] { ',' }), token)).ToList();
            foreach (var item in r)
            {
                var sups = new List<RFQSupplierDetails>();
                foreach (var sup in item.SuppliersDetails)
                {
                    var dataTab = new List<RFQQuoteInfo>();

                    foreach (var product in sup.DataTable)
                    {
                        if (product.ExwNetPriceEuro != null && product.Currency != null)
                        {
                            if (product.Currency == "EUR")
                            {
                                product.PriceCurrencyToEuro = product.ExwNetPriceEuro;
                            }
                            else if (product.Currency == "CAD")
                            {
                                //product.CreatedBy=rateCAD.ToString();
                                product.PriceCurrencyToEuro = (rateCAD * decimal.Parse(product.ExwNetPriceEuro, CultureInfo.InvariantCulture)).ToString();
                            }
                            else if (product.Currency == "USD")
                            {
                                product.PriceCurrencyToEuro = (rateUSD * decimal.Parse(product.ExwNetPriceEuro, CultureInfo.InvariantCulture)).ToString();
                            }
                        }
                        dataTab.Add(product);
                    }
                    sups.Add(sup);

                    sup.DataTable=dataTab;
                }
            }
            return Ok(r);
            //var l = new List<RFQDetails>();

            //foreach (var item in rfqNumbers.Split(","))
            //{
            //    var l2 = await GetRFQDetails(item, null, null, token);
            //    var x = (OkObjectResult)l2.Result;

            //    l.Add(x.Value as RFQDetails);
            //}

            //return Ok(l);
        }

        /// <summary>
        /// Get RFQ details
        /// </summary>
        /// <param name="rfqNumber">RFQ number to get details</param>
        /// <param name="SortBy">What to sort</param>
        /// <param name="SortType">Ascending or Descending</param>
        /// <param name="token">Cancellation token</param>
        /// <response code="200">RFQ details</response>
        [HttpGet("{rfqNumber}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<RFQDetails>> GetRFQDetails(
            [FromRoute] string rfqNumber,
            [FromQuery] string SortType,
            [FromQuery] string SortBy,
            CancellationToken token)
        {
            var client = new HttpClient();
            client.Timeout = TimeSpan.FromMinutes(3);
            var responseCAD = await client.GetAsync("https://wise.com/gb/currency-converter/cad-to-eur-rate?amount=31");
            var responseUSD = await client.GetAsync("https://wise.com/gb/currency-converter/usd-to-eur-rate?amount=51");
            var bodyCAD = await responseCAD.Content.ReadAsStringAsync();
            var bodyUSD = await responseUSD.Content.ReadAsStringAsync();
            var pageCAD = new HtmlDocument();
            pageCAD.LoadHtml(bodyCAD);
            var pageUSD = new HtmlDocument();
            pageUSD.LoadHtml(bodyUSD);
            decimal.TryParse(pageCAD.DocumentNode.SelectSingleNode("//span[contains(@class, 'text-success')]")?.InnerText ?? "60",NumberStyles.Any,CultureInfo.InvariantCulture,out  var rateCAD);
            //decimal.TryParse("0.93670", NumberStyles.Any,CultureInfo.InvariantCulture,out  var rateUSD);
            decimal.TryParse(pageUSD.DocumentNode.SelectSingleNode("//span[contains(@class, 'text-success')]")?.InnerText ?? "70", NumberStyles.Any, CultureInfo.InvariantCulture, out var rateUSD);

            var rfq = await _rfqService.GetRFQDetailsAsync(HttpUtility.UrlDecode(rfqNumber),SortBy,SortType, token);
            
            
            var sups = new List<RFQSupplierDetails>();
            foreach (var supplier in rfq.SuppliersDetails)
            {
                var dataTab = new List<RFQQuoteInfo>();
                supplier.LastUpdateDate = DateTime.MinValue;
                supplier.EndingDate = DateTime.MinValue;
                
                foreach (var product  in supplier.DataTable)
                {
                    //product.CreatedBy = rateUSD.ToString();

                    if (product.ExwNetPriceEuro!=null && product.Currency!=null)
                    {
                        var decimalCase = Regex.Matches(product.ExwNetPriceEuro, "(?<end>(((\\.\\d{1,2})|(,\\d+))$)|(\\d+))").Select(I => I.Groups["end"].Value).ToList();
                        product.ExwNetPriceEuro = string.Join("", decimalCase).Replace(",", ".");

                        if (product.Currency=="EUR")
                        {
                            product.PriceCurrencyToEuro = product.ExwNetPriceEuro;
                        }
                        else if (product.Currency=="CAD")
                        {
                            //product.CreatedBy=rateCAD.ToString();
                            product.PriceCurrencyToEuro = (rateCAD * decimal.Parse(product.ExwNetPriceEuro, CultureInfo.InvariantCulture)).ToString();
                        }else if (product.Currency=="USD")
                        {
                            product.PriceCurrencyToEuro = (rateUSD * decimal.Parse(product.ExwNetPriceEuro, CultureInfo.InvariantCulture)).ToString();
                        }
                    }



                    if (string.IsNullOrWhiteSpace(supplier.CountryCode) || string.IsNullOrWhiteSpace(product.ProductCode))
                    {
                        dataTab.Add(product);
                        continue;
                    }
                    if (product.LastUpdateDate>supplier.LastUpdateDate)
                    {
                        supplier.LastUpdateDate = product.LastUpdateDate;
                    }        
                    if (product.EndingDate > supplier.EndingDate)
                    {
                        supplier.EndingDate = product.EndingDate;
                    }
                    ProductV2 p = await _productsService.GetProductAsync(supplier.CountryCode, product.ProductCode, token);
                    if (p==null)
                    {
                        dataTab.Add(product);
                        continue;
                    }

                    if (p.Documents!=null)
                    {
                        product.Documents = p.Documents;
                        

                    }
                    product.PrecautionsForStorage = p.PrecautionsForStorage;
                    product.MAHolder = p.MAHolder;
                    product.RetailPrice = p.Prices?.FirstOrDefault(I => I.Type == "Retail")?.Value.ToString();
                    dataTab.Add(product);
                }
                sups.Add(supplier);
                
                supplier.DataTable=dataTab;
            }
            rfq.SuppliersDetails = sups;
            return Ok(rfq);
        }

        /// <summary>
        /// Get RFQ details History
        /// </summary>
        /// <param name="rfqNumber">RFQ number to get details</param>
        /// <param name="SortBy">What to sort</param>
        /// <param name="SortType">Ascending or Descending</param>
        /// <param name="token">Cancellation token</param>
        /// <response code="200">RFQ details</response>
        [HttpGet("{rfqNumber}/history")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<RFQDetails>> GetRFQDetailsHistory(
            [FromRoute] string rfqNumber,
            [FromQuery] string SortType,
            [FromQuery] string SortBy,
            CancellationToken token)
        {
            
            var rfq = await _rfqService.GetRFQDetailsHistoryAsync(HttpUtility.UrlDecode(rfqNumber), token);
            

            return Ok(rfq);
        }
        /// <summary>
        /// Change Due Date
        /// </summary>
        /// <param name="rfqNumber">RFQ number</param>
        /// <param name="date">New Due Date</param>
        /// <param name="token"></param>
        /// <returns>Date Updated</returns>
        [HttpPut("{rfqNumber}/dueDate/reminder")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ChangeDueDate(
            [FromRoute] string rfqNumber,
            [FromBody] object date,
            CancellationToken token)
        {
            rfqNumber= HttpUtility.UrlDecode(rfqNumber ?? "naada");
            if (rfqNumber== "naada")
            {
                return BadRequest();
            }
            try
            {
                var RFQ = Newtonsoft.Json.JsonConvert.DeserializeObject<ChangeRFQDueDate>(date.ToString());
                await _rfqService.ChangeRFQDate(rfqNumber, RFQ, token);
                return Ok();
            }catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
            
        }
        /// <summary>
        /// Change State
        /// </summary>
        /// <param name="rfqNumber">RFQ number</param>
        /// <param name="state">New State</param>
        /// <param name="token"></param>
        /// <returns>State Updated</returns>
        [HttpPut("{rfqNumber}/state/reason")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ChangeState(
            [FromRoute] string rfqNumber,
            [FromBody] object state,
            CancellationToken token)
        {
            rfqNumber = HttpUtility.UrlDecode(rfqNumber ?? "naada");
            if (rfqNumber== "naada")
            {
                return BadRequest();
            }
            try
            {
                var RFQ = Newtonsoft.Json.JsonConvert.DeserializeObject<ChangeRFQState>(state.ToString());
                await _rfqService.ChangeRFQState(rfqNumber, RFQ, token);
                return Ok();
            }catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
            
        }
        /// <summary>
        /// Change RFQ assignee
        /// </summary>
        /// <param name="rfqNumber">RFQ number</param>
        /// <param name="username">Username to assign to RFQ, or empty to unsign</param>
        /// <param name="token">Cancellation token</param>
        /// <response code="200">Assignee updated</response>
        [HttpPut("{rfqNumber}/assignee")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ChangeAssignee(
            [FromRoute] string rfqNumber,
            [FromBody] string username,
            CancellationToken token)
        {
            var error = await _rfqService.ChangeAssigneeAsync(HttpUtility.UrlDecode(rfqNumber), username, token);

            if(error != RFQUpdateError.None)
            {
                return BadRequest(new { Error = error });
            }
            return Ok();
        }

        /// <summary>
        /// Change RFQ table data
        /// </summary>
        /// <param name="rfqNumber">RFQ number</param>
        /// <param name="dataByThreadId">Table data by ThreadId</param>
        /// <param name="token">Cancellation token</param>
        /// <response code="200">Table data updated</response>
        [HttpPut("{rfqNumber}/data")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ChangeData(
            [FromRoute] string rfqNumber,
            [FromBody] IDictionary<string, IEnumerable<RFQQuote>> dataByThreadId,
            CancellationToken token)
        {
            var error = await _rfqService.ChangeRFQTableDataAsync(User.GetUsername(), HttpUtility.UrlDecode(rfqNumber), dataByThreadId, token);

            if (error != RFQUpdateError.None)
            {
                return BadRequest(new { Error = error });
            }
            return Ok();
        }
        /// <summary>
        /// Change RFQ cards
        /// </summary>
        /// <param name="rfqNumber">RFQ number</param>
        /// <param name="cards">Table data by ThreadId</param>
        /// <param name="token">Cancellation token</param>
        /// <response code="200">Table data updated</response>
        [HttpPut("{rfqNumber}/cards")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ChangeCards(
            [FromRoute] string rfqNumber,
            [FromBody] object cards,
            CancellationToken token)
        {
            rfqNumber = HttpUtility.UrlDecode(rfqNumber);
            var rfqCards = Newtonsoft.Json.JsonConvert.DeserializeObject<List<RFQCards>>(cards.ToString());
            var x = await _rfqService.UpdateRfqCard(rfqNumber, rfqCards);
            return Ok();
        }

        /// <summary>
        /// Get the next possible RFQs number
        /// </summary>
        /// <param name="token">Cancellation token</param>
        /// <response code="200">RFQ Number</response>
        [HttpGet("nextNumber")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetNextRfqNumber(CancellationToken token)
        {
            return Ok(new
            {
                NextRfqNumber = await _rfqService.GetNextRFQNumberAsync(token)
            });
        }
    }
}
