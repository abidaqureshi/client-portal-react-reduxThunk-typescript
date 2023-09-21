using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using WhichPharma.Models.Attributes;

namespace WhichPharmaPortal.Models.Client
{
    public class RFQRequest
    {
        [Optional]
        [StringLength(500, MinimumLength = 4)]
        public string SenderEmail { get; set; }
        [Optional]
        [MaxLength(500)]
        public string SenderPassword { get; set; }
        [Optional]
        [MaxLength(500)]
        public string SenderGmailAccessCode { get; set; }
        [Required]
        [MinLength(1)]
        public IEnumerable<RFQEmailData> EmailsData { get; set; }
        [Optional]
        public IEnumerable<string> RfqNumbersToAssignToExistingOnes { get; set; }
    }
}
