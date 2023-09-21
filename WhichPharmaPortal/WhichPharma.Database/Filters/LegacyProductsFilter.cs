using System.Collections.Generic;
using WhichPharma.Models.Database.Products;

namespace WhichPharma.Database.Filters
{
    public class LegacyProductsFilter
    {
        public string AnyContains { get; set; }
        public string NameContains { get; set; }
        public IEnumerable<string> ATCContains { get; set; }
        public string SortBy { get; set; }
        public bool SortDescending { get; set; }
        public bool IncludeExprice { get; set; }
        public IEnumerable<string> ActiveSubstances { get; set; }
        public IEnumerable<string> Countries { get; set; }
        public IEnumerable<string> Origins { get; set; }
        public IEnumerable<string> DrugForms { get; set; }
        public IEnumerable<string> AdministrationForms { get; set; }
        public IEnumerable<LegacyProductStatus> Statuses { get; set; }
        public string ProductCodeOrMANumberContains { get; set; }
        public string ManufacturerOrMAHolderContains { get; set; }
    }
}
