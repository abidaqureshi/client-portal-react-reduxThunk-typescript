using System;
using System.Collections.Generic;
using WhichPharma.Models.Attributes;

namespace WhichPharmaPortal.Models.Client
{
    public class ProductV2
    {
        public IEnumerable<string> ActiveSubstances { get; set; }

        [Optional]
        public IEnumerable<string> AdministrationCategories { get; set; }

        [Optional]
        public string AdministrationRoute { get; set; }

        public string ATC { get; set; }

        [Optional]
        public IEnumerable<string> AutoActiveSubstances { get; set; }

        [Optional]
        public string AutoATC { get; set; }

        [Optional]
        public string AutoName { get; set; }

        [Optional]
        public IDictionary<string, string> Codes { get; set; }

        [Optional]
        public bool? ContainsNarcoticOrPsychotropic { get; set; }

        public string CountryCode { get; set; }

        public string CountryName { get; set; }

        [Optional]
        public IDictionary<string, string> Documents { get; set; }

        public string Id { get; set; }
        [Optional]
        public bool? IsAdditionalMonitoring { get; set; }

        public bool? IsAuthorised { get; set; }

        [Optional]
        public bool? IsBiological { get; set; }

        [Optional]
        public bool? IsGeneric { get; set; }

        [Optional]
        public bool? IsHospitalar { get; set; }

        [Optional]
        public bool? IsMarketed { get; set; }

        [Optional]
        public bool? IsNarcotic { get; set; }

        [Optional]
        public bool? IsParallelImport { get; set; }

        [Optional]
        public bool? IsPrescription { get; set; }

        [Optional]
        public bool? IsPsychotropic { get; set; }

        public DateTime LastUpdate { get; set; }
        [Optional]
        public string MAHolder { get; set; }

        [Optional]
        public string Manufacturer { get; set; }

        public string Name { get; set; }
        
        public string OriginalName { get; set; }

        [Optional]
        public IDictionary<string, string> OtherFields { get; set; }

        [Optional]
        public string Package { get; set; }

        [Optional]
        public string PackageDetailed { get; set; }

        [Optional]
        public string PharmaceuticalForm { get; set; }

        [Optional]
        public IEnumerable<string> PharmaceuticalFormCategories { get; set; }

        [Optional]
        public IEnumerable<Price> Prices { get; set; }

        public string ProductCode { get; set; }
        public string ScrapingOrigin { get; set; }
        public string ScrapingOriginIdentifier { get; set; }
        public string ScrapingOriginUrl { get; set; }

        [Optional]
        public ShortageInfo ShortageInfo { get; set; }

        [Optional]
        public string StatusNotes { get; set; }

        [Optional]
        public string Strength { get; set; }
        
        [Optional]
        public string PrecautionsForStorage { get; set; }
        // Enriched
        [Optional]
        public string StrengthDetailed { get; set; }
    }
}
