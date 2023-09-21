using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace WhichPharma.Models.Server
{
    public class GetSuppliersFilters
    {
        [FromQuery(Name = "name")]
        [SwaggerParameter("Keyword that Name must contain")]
        public string Name { get; set; }

        [FromQuery(Name = "countries")]
        [SwaggerParameter("Country 2 letters codes sparated by comma that product Country must match at least one")]
        public string Countries { get; set; }

        [FromQuery(Name = "statuses")]
        [SwaggerParameter("Exact values sparated by comma that product Status must match at least one")]
        public string Statuses { get; set; }
    }
}
