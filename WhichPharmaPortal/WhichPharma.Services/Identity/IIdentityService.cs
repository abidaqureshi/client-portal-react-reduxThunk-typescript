using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WhichPharmaPortal.Models.Client;

namespace WhichPharma.Services.Identity
{
    public interface IIdentityService
    {
        Task<AuthenticatedUser> AuthenticateAsync(string username, string password, CancellationToken token);
        Task<AuthenticatedUser> AuthenticateWithThirdPartyTokenAsync(string provider, string code, CancellationToken token);
        Task<UserChangeResult> CreateUserAsync(CreateUser user, CancellationToken token);
        Task<UserChangeResult> UpdateUserAsync(string username, UpdateUser user, CancellationToken token);
        Task<UserChangeResult> UpdateUserThirdPartyLinkAsync(string username, string provider, string id, CancellationToken token);
        Task UpdateCustomSettingsAsync(string username, IDictionary<string, string> settings, CancellationToken token);
        Task<IEnumerable<User>> GetAllUsersAsync(CancellationToken token);
        Task<User> GetUserAsync(string username, CancellationToken token);
        string GenerateJWTForExternalUsers(string externalIdentifier, string email, DateTime expireDate);
    }
}
