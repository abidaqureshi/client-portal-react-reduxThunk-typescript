using System.Collections.Generic;
using WhichPharma.Models.Attributes;

namespace WhichPharmaPortal.Models.Client
{
    public class SupplierRFQQuotesChange
    {
        public IEnumerable<RFQQuote> Quotes { get; set; }
        
        [Optional]
        public bool? ReceiveEmailCopyWhenSubmitting { get; set; }
    }
}
