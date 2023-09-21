using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace WhichPharma.Models.Server
{
    public class GetShortagesFilters
    {
        [FromQuery(Name = "countries")]
        [SwaggerParameter("Country 2 letters codes sparated by comma that shortage Country must match at least one")]
        public string Countries { get; set; }

        [FromQuery(Name = "types")]
        [SwaggerParameter("Exact values sparated by comma that shortage Type must match at least one")]
        public string Types { get; set; }

        [FromQuery(Name = "origins")]
        [SwaggerParameter("Exact values sparated by comma that shortage Origin must match at least one")]
        public string Origins { get; set; }

        [FromQuery(Name = "minStartDate")]
        [SwaggerParameter("Date that shortage Start must be higher or equal than")]
        public string MinStartDate { get; set; }

        [FromQuery(Name = "maxStartDate")]
        [SwaggerParameter("Date that shortage Start must be lower or equal than")]
        public string MaxStartDate { get; set; }

        [FromQuery(Name = "minEndDate")]
        [SwaggerParameter("Date that shortage End must be higher or equal than")]
        public string MinEndDate { get; set; }

        [FromQuery(Name = "maxEndDate")]
        [SwaggerParameter("Date that shortage End must be lower or equal than")]
        public string MaxEndDate { get; set; }
    }
}
