using System;
using WhichPharma.Models.Attributes;

namespace WhichPharmaPortal.Models.Client
{
    public class RFQQuote
    {
        public string Id { get; set; }
        public string RfqNr { get; set; }
        public string Name { get; set; }
        public RFQQuoteState State { get; set; }
        [Optional]
        public DateTime EndingDate { get; set; }
        [Optional]
        public string RfqDescription { get; set; }
        [Optional]
        public string ActiveSubstances { get; set; }
        [Optional]
        public string ExpDate { get; set; }
        [Optional]
        public string LeadTimeToDeliver { get; set; }
        [Optional]
        public string AvailabilityPacks { get; set; }
        [Optional]
        public int? Availability { get; set; }
        [Optional]
        public string ExwNetPriceEuro { get; set; }
        [Optional]
        public string PriceCurrencyToEuro { get; set; }
        [Optional]
        public string UnitQuant { get; set; }
        [Optional]
        public string PackSize { get; set; }
        [Optional]
        public string ProductCode { get; set; }
        [Optional]
        public string Currency { get; set; }
        [Optional]
        public string CountryOfOrigin { get; set; }
        [Optional]
        public string MAHolder { get; set; }
        [Optional]
        public string Comments { get; set; }
        [Optional]
        public bool IsAlternative { get; set; }


        //[Optional]
        //public string Attachment { get; set; }
    }
}
