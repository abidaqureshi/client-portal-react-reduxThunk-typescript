using System;
using WhichPharma.StreakIntegration;

namespace WhichPharmaPortal.Config.Clients
{
    public class StreakIntegrationConfig : IStreakIntegrationClientConfig
    {
        public string ApiBaseUrl { get; set; }
    }
}
