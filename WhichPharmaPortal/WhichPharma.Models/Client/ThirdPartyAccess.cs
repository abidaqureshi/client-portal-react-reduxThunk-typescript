namespace WhichPharmaPortal.Models.Client
{
    public class ThirdPartyAccess
    {
        public string Provider { get; set; }
        public string Code { get; set; }

        public string Id { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string ImageUrl { get; set; }
    }
}
