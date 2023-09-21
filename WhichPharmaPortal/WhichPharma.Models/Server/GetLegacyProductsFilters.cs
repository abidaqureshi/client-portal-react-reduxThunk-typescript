using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace WhichPharma.Models.Server
{
    public class GetLegacyProductsFilters
    {
        [FromQuery(Name = "free")]
        [SwaggerParameter("Free text which is searched in all fields")]
        public string FreeText { get; set; }

        [FromQuery(Name = "name")]
        [SwaggerParameter("Keyword that Name must contain")]
        public string Name { get; set; }

        [FromQuery(Name = "atc")]
        [SwaggerParameter("Keywords separated by comma that ATC must contain at least one")]
        public string Atc { get; set; }

        [FromQuery(Name = "activeSubstances")]
        [SwaggerParameter("Keywords sparated by comma that must be present in ActiveSubstances")]
        public string ActiveSubstances { get; set; }

        [FromQuery(Name = "drugForms")]
        [SwaggerParameter("Keywords sparated by comma that DrugForm must match at least one")]
        public string DrugForms { get; set; }

        [FromQuery(Name = "administrationForms")]
        [SwaggerParameter("Keywords sparated by comma that AdministrationForm must match at least one")]
        public string AdministrationForms { get; set; }

        [FromQuery(Name = "countries")]
        [SwaggerParameter("Country 2 letters codes sparated by comma that product Country must match at least one")]
        public string Countries { get; set; }

        [FromQuery(Name = "origins")]
        [SwaggerParameter("Exact values sparated by comma that product Origin must match at least one")]
        public string Origins { get; set; }

        [FromQuery(Name = "statuses")]
        [SwaggerParameter("Exact values sparated by comma that product Status must match at least one")]
        public string Statuses { get; set; }

        [FromQuery(Name = "sortBy")]
        [SwaggerParameter("Column name that data must be sorted by")]
        public string SortBy { get; set; }

        [FromQuery(Name = "sortType")]
        [SwaggerParameter("Sort type,\"asc\" for ascending or \"desc\" for descending (ascending is used when omitted)")]
        public string SortType { get; set; }

        [FromQuery(Name = "includeExprice")]
        [SwaggerParameter("Force to include exprice results (they're omitted when duplicate products)")]
        public bool IncludeExprice { get; set; }

        [FromQuery(Name = "productCode")]
        [SwaggerParameter("Keyword that ProductCode or MANumber must contain")]
        public string ProductCode { get; set; }

        [FromQuery(Name = "holder")]
        [SwaggerParameter("Keyword that MA Holder or Manufacturer must contain")]
        public string Holder { get; set; }
    }
}
