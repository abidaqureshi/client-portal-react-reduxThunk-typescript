using System;
using WhichPharma.Models.Attributes;

namespace WhichPharmaPortal.Models.Client
{
    public class RFQSummary
    {
        public string Number { get; set; }
        public DateTime CreationDate { get; set; }
        public string Title { get; set; }
        public RFQState State { get; set; }
        public DateTime StateChangeDate { get; set; }
        [Optional]
        public string AssigneeUsername { get; set; }
        [Optional]
        public string Reason { get; set; }
        [Optional]
        public long? Reminder { get; set; }
        [Optional]
        public DateTime? EndingDate { get; set; }
    }
}
