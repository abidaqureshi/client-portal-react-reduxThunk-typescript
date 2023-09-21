using WhichPharma.Services.Identity;

namespace WhichPharmaPortal.Config.Services
{
    public class IdentityServiceConfiguration : IIdentityServiceConfiguration
    {
        public string Secret { get; set; }
    }
}
