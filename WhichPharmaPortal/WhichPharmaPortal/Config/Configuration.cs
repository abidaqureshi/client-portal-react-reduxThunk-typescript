using WhichPharma.Queue.Implementations.RabbitMQ;
using WhichPharmaPortal.Config.Clients;
using WhichPharmaPortal.Config.Database;
using WhichPharmaPortal.Config.Services;

namespace WhichPharmaPortal.Config
{
    public class Configuration
    {
        public DatabaseConfig Database { get; set; }
        public LoggingConfiguration Logging { get; set; }
        public IdentityServiceConfiguration IdentityService { get; set; }
        public RFQServiceConfiguration RFQService { get; set; }
        public RabbitMQClientConfig QueueClient { get; set; }
        public GoogleServiceConfig GoogleService { get; set; }
        public StreakIntegrationConfig StreakIntegration { get; set; }
        public EmailServiceConfig EmailService { get; set; }
    }
}
