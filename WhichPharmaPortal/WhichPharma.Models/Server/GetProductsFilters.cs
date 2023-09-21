using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace WhichPharma.Models.Server
{
    public class GetProductsFilters
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
        public string PharmaceuticalForms { get; set; }

        [FromQuery(Name = "administrationForms")]
        [SwaggerParameter("Keywords sparated by comma that AdministrationForm must match at least one")]
        public string Administrations { get; set; }

        [FromQuery(Name = "countries")]
        [SwaggerParameter("Country 2 letters codes sparated by comma that product Country must match at least one")]
        public string Countries { get; set; }

        [FromQuery(Name = "origins")]
        [SwaggerParameter("Exact values sparated by comma that product Origin must match at least one")]
        public string Origins { get; set; }

        [FromQuery(Name = "sortBy")]
        [SwaggerParameter("Column name that data must be sorted by")]
        public string SortBy { get; set; }

        [FromQuery(Name = "isAuthorised")]
        [SwaggerParameter("Whether the products must be authorized or not, \"yes\" or \"no\".")]
        public string IsAuthorised { get; set; }

        [FromQuery(Name = "isMarketed")]
        [SwaggerParameter("Marketing states that products must have, \"yes\", \"no\" or \"unknown\"")]
        public string IsMarketed { get; set; }
        
        [FromQuery(Name = "commercialized")]
        [SwaggerParameter("Whether the products must be authorized or not, \"yes\" or \"no\".")]
        public string Commercialized { get; set; }

        [FromQuery(Name = "notCommercialized")]
        [SwaggerParameter("Marketing states that products must have, \"yes\", \"no\" or \"unknown\"")]
        public string NotCommercialized { get; set; }

        [FromQuery(Name = "sortType")]
        [SwaggerParameter("Sort type,\"asc\" for ascending or \"desc\" for descending (ascending is used when omitted)")]
        public string SortType { get; set; }

        [FromQuery(Name = "productCode")]
        [SwaggerParameter("Keyword that ProductCode must contain")]
        public string ProductCode { get; set; }

        [FromQuery(Name = "holder")]
        [SwaggerParameter("Keyword that MA Holder or Manufacturer must contain")]
        public string Holder { get; set; }

        [FromQuery(Name = "isPsychotropic")]
        [SwaggerParameter("Search if psychotropic product")]
        public bool? IsPsychotropic { get; set; }

        [FromQuery(Name = "isAdditionalMonitoring")]
        [SwaggerParameter("Search if IsAdditionalMonitoring product")]
        public bool? IsAdditionalMonitoring { get; set; }

        [FromQuery(Name = "isBiological")]
        [SwaggerParameter("Search if isBiological product")]
        public bool? IsBiological { get; set; }
        
        [FromQuery(Name = "isGeneric")]
        [SwaggerParameter("Search if isGeneric product")]
        public bool? IsGeneric { get; set; }
        
        [FromQuery(Name = "isHospitalar")]
        [SwaggerParameter("Search if isHospitalar product")]
        public bool? IsHospitalar { get; set; }
        
        [FromQuery(Name = "isPrecautionsForStorage")]
        [SwaggerParameter("Search if isPrecautionsForStorage product")]
        public bool? IsPrecautionsForStorage { get; set; }
        
        [FromQuery(Name = "isPrescription")]
        [SwaggerParameter("Search if isPrescription product")]
        public bool? IsPrescription { get; set; }

        [FromQuery(Name = "isShortage")]
        [SwaggerParameter("Search if isShortage product")]
        public bool? IsShortage { get; set; }

        [FromQuery(Name = "additionalInformation")]
        [SwaggerParameter("Search if additionalInformation product")]
        public string AdditionalInformation { get; set; }


    }
}
