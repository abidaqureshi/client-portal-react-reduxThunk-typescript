using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using WhichPharma.Models.Attributes;

namespace WhichPharmaPortal.Models.Client
{
    public class Labels
    {
        public string Label { get; set; }
        public string CurrenyFormat { get; set; }
        public decimal? Value { get; set; }
    }
    public class CountryAux
    {
        public string Code { get; set; }
        public string Name { get; set; }
    }
    
    public class RFQCards
    {
        [Optional]
        public IEnumerable<Labels> AdditionalCostList { get; set; }
        [Optional]
        public string CardDate { get; set; }
        [Optional]
        public string ThreadId { get; set; }
        [Optional]
        public string State{ get; set; }
        [Optional]
        public CountryAux Country { get; set; }
        [Optional]
        public string Supplier { get; set; }
        [Optional]
        public string SupplierId { get; set; }
        [Optional]
        public string Type { get; set; }
        [Optional]
        public string SupplierReplyForm { get; set; }
        [Optional]
        public string MaxUnitPrice { get; set; }
        [Optional]
        public decimal? MinUnitPrice { get; set; }
        [Optional]
        public decimal? AverageUnitPrice { get; set; }
        [Optional]
        public decimal? RetailPrice { get; set; }
        [Optional]
        public decimal? MaxLeadTime { get; set; }
        [Optional]
        public decimal? MinLeadTime { get; set; }
        [Optional]
        public decimal? AverageLeadTime { get; set; }
        [Optional]
        public string AvailabilityPacsForCard { get; set; }
        [Optional]
        public decimal? WeightedPrice  { get; set; }
        [Optional]
        public decimal? AdditionalCost { get; set; }
        [Optional]
        public DateTime CreationDate { get; set; }
        [Optional]
        public string CreatedBy { get; set; }
        [Optional]
        public string UpdatedBy { get; set; }
        [Optional]
        public string PrecautionsForStorage { get; set; }
        [Optional]
        public DateTime LastUpdateDate { get; set; }
        [Optional]
        public IDictionary<string, string> Documents { get; set; }
        [Optional]
        public string Id { get; set; }
        public string RfqNr { get; set; }
        public string Name { get; set; }
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
        public string MAHolder { get; set; }
        [Optional]
        public string Comments { get; set; }
        [Optional]
        public string Contacts { get; set; }
        [Optional]
        public bool IsAlternative { get; set; }
        [Optional]
        public bool IsCopy { get; set; } = false;



    }
}
