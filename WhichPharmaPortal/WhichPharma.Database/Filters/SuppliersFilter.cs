using System.Collections.Generic;
using WhichPharma.Models.Database.Suppliers;

namespace WhichPharma.Database.Filters
{
    public class SuppliersFilter
    {
        public string NameContains { get; set; }
        public IEnumerable<string> Countries { get; set; }
        public IEnumerable<SupplierState> Statuses { get; set; }
    }
}
