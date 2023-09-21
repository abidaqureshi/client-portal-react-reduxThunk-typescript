using WhichPharma.Services.Email;

namespace WhichPharmaPortal.Config.Services
{
    public class EmailServiceConfig : IEmailServiceConfig
    {
        public string Email { get; set; }
        public string Name { get; set; }
        public string Password { get; set; }
    }
}
