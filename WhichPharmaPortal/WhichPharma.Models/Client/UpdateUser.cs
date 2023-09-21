using WhichPharma.Models.Attributes;

namespace WhichPharmaPortal.Models.Client
{
    public class UpdateUser
    {
        [Optional]
        public string Password { get; set; }
        [Optional]
        public string Email { get; set; }
        [Optional]
        public UserRole[] Roles { get; set; }
        [Optional]
        public string FirstName { get; set; }
        [Optional]
        public string LastName { get; set; }
        [Optional]
        public string Title { get; set; }
        [Optional]
        public string StreakApiKey { get; set; }
    }
}
