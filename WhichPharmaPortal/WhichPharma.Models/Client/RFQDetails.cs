using System.Collections.Generic;

namespace WhichPharmaPortal.Models.Client
{
    public class RFQDetails
    {
        public string RFQNumber { get; set; }
        public IEnumerable<RFQNote> Notes { get; set; }
        public IEnumerable<RFQSupplierDetails> SuppliersDetails { get; set; }
        public List<RFQCards> Cards { get; set; }
    }
}
