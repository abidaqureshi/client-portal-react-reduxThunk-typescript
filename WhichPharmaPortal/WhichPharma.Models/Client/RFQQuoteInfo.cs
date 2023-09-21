using System;
using System.Collections.Generic;
using WhichPharma.Models.Attributes;

namespace WhichPharmaPortal.Models.Client
{
    public class RFQQuoteInfo : RFQQuote
    {
        public string CreatedBy { get; set; }

        public string RetailPrice { get; set; }
        public string SPC{ get; set; }
        public string PIL{ get; set; }
        public string SPC_PIL{ get; set; }
        public DateTime CreationDate { get; set; }
        [Optional]
        public string UpdatedBy { get; set; }
        [Optional]
        public DateTime LastUpdateDate { get; set; }
        public IDictionary<string, string> Documents { get; set; }
        [Optional]
        public string PrecautionsForStorage { get; set; }
    }
}
