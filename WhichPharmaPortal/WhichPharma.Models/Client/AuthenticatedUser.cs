using System.Collections.Generic;
using WhichPharma.Models.Attributes;

namespace WhichPharmaPortal.Models.Client
{
    public class AuthenticatedUser
    {
        public string Username { get; set; }
        public string AccessToken { get; set; }
        public UserRole[] Roles { get; set; }
        [Optional]
        public IDictionary<string, string> Settings { get; set; }
        [Optional]
        public string Email { get; set; }
        [Optional]
        public string ImageUrl { get; set; }
    }
}
