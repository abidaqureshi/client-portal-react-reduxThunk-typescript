namespace WhichPharma.Services.Email
{
    public interface IEmailServiceConfig
    {
        public string Email { get; set; }
        public string Name { get; set; }
        public string Password { get; set; }
    }
}
