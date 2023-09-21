using System;
using WhichPharma.Models.Attributes;

namespace WhichPharmaPortal.Models.Client
{
    public class ShortageInfo
    {
        public DateTime Start { get; set; }
        [Optional]
        public DateTime? End { get; set; }
        public bool IsActive => Start.Date <= DateTime.UtcNow && (!End.HasValue || End.Value.Date.AddDays(1) >= DateTime.UtcNow);
        public ShortageType Type { get; set; }
        public string AdditionalNotes { get; set; }
        public DateTime LastUpdate { get; set; }
        public string Reason { get; set; }
    }
}
