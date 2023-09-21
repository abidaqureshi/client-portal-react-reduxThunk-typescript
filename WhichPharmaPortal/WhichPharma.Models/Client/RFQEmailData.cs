using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WhichPharmaPortal.Models.Client
{
    public class RFQEmailData
    {
        [Required]
        [StringLength(500, MinimumLength = 4)]
        public string SupplierId { get; set; }
        [Required]
        [StringLength(500, MinimumLength = 4)]
        public string Recipient { get; set; }
        [Required]
        [StringLength(500, MinimumLength = 4)]
        public string RecipientName { get; set; }
        public string[] CC { get; set; }
        [Required]
        [StringLength(500, MinimumLength = 4)]
        public string Subject { get; set; }
        [Required]
        public IEnumerable<RFQQuote> TableData { get; set; }
        [Required]
        [StringLength(10000, MinimumLength = 20)]
        public string EmailTemplate { get; set; }
    }
}
