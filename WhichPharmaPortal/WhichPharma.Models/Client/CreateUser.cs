using WhichPharma.Models.Attributes;

namespace WhichPharmaPortal.Models.Client
{
    public class CreateUser
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public UserRole[] Roles { get; set; }

        [Optional]
        public string Email { get; set; }
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
