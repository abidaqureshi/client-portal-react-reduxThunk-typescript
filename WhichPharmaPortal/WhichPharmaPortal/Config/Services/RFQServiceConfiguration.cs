using WhichPharma.Services.RFQs;

namespace WhichPharmaPortal.Config.Services
{
    public class RFQServiceConfiguration : IRFQServiceConfiguration
    {
        public bool Testing { get; set; }
        public string[] CC { get; set; }
        public string ReplyFormUrlBase { get; set; }
    }
}
