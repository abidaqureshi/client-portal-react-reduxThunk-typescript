using System;
using System.Collections.Generic;
using WhichPharma.Models.Attributes;

namespace WhichPharmaPortal.Models.Client
{
    public class RFQSupplierDetails
    {
        public string ThreadId { get; set; }
        public string SupplierId { get; set; }
        public string SupplierName { get; set; }
        public string SupplierContactName { get; set; }
        public string SupplierContactEmail { get; set; }

        //public string SupplierType { get; set; }
        public string CountryCode { get; set; }
        public string Country { get; set; }
        public DateTime LastIteration { get; set; }
        public DateTime? LastUpdateDate { get; set; }
        public DateTime? EndingDate { get; set; }
        public RFQEntryState State { get; set; }
        public string Subject { get; set; }
        [Optional]
        public long? Reminder{ get; set; }
        public int UnreadMessages { get; set; }
        public IEnumerable<RFQQuoteInfo> DataTable { get; set; }

        


        [Optional]
        public string ExternalAccessLink { get; set; }
        [Optional]
        public string Reason { get; set; }
        public string SupplierType { get; set; }
    }
}
