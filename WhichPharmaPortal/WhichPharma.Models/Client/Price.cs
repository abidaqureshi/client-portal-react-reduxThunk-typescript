namespace WhichPharmaPortal.Models.Client
{
    public class Price
    { 
        public string Type { get; set; }
        public decimal Value { get; set; }
        public string CurrencyCode { get; set; }
        public bool IncludeVAT { get; set; }
    }
}
