using System.Collections.Generic;
using WhichPharma.Models.Database.Products;

namespace WhichPharma.Database.Filters
{
    public class ProductsFilter
    {
        public string AnyContains { get; set; }
        public string NameContains { get; set; }
        public IEnumerable<string> ATCContains { get; set; }
        public string SortBy { get; set; }
        public bool SortDescending { get; set; }
        public IEnumerable<string> ActiveSubstances { get; set; }
        public IEnumerable<string> Countries { get; set; }
        public IEnumerable<string> Origins { get; set; }
        public IEnumerable<string> PharmaceuticalForms { get; set; }
        public IEnumerable<string> Administrations { get; set; }
        public bool? IsAuthorized { get; set; }
        public IEnumerable<bool?> IsMarketed { get; set; }
        public string ProductCodesContains { get; set; }
        public string ManufacturerOrMAHolderContains { get; set; }

        public IEnumerable<string> AdditionalInformation { get; set; }
        public bool? IsShortage { get; set; }
    }
}
