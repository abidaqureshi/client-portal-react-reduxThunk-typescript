using WhichPharma.Models.Attributes;

namespace WhichPharmaPortal.Models.Client
{
    public class Login
    {
        [Optional]
        public string Username { get; set; }
        [Optional]
        public string Password { get; set; }
        [Optional]
        public string ThirdPartyProvider { get; set; }
        [Optional]
        public string ThirdPartyCode { get; set; }
    }
}
