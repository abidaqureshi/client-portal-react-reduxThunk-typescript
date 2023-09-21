using System;
using WhichPharma.Models.Attributes;

namespace WhichPharmaPortal.Models.Client
{
    public class Shortage
    {
        public string Id { get; set; }
        [Optional]
        public string ProductId { get; set; }
        public string ScrapingOrigin { get; set; }
        public string Country { get; set; }
        public string CountryCode { get; set; }
        public bool IsActive => Start.Date <= DateTime.UtcNow && (!End.HasValue || End.Value.Date.AddDays(1) >= DateTime.UtcNow);
        public DateTime Start { get; set; }
        [Optional]
        public DateTime? End { get; set; }
        public ShortageType Type { get; set; }
        public string AdditionalNotes { get; set; }
        public DateTime LastUpdate { get; set; }
        [Optional]
        public ProductV1 Product { get; set; }
    }
}
