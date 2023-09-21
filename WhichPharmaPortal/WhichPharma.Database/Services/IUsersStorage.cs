using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Models.Database.Users;

namespace WhichPharma.Database.Services
{
    public interface IUsersStorage
    {
        Task<List<User>> GetAllUsersAsync(CancellationToken token);
        Task<User> AuthorizeAndGetUserAsync(string username, string password, CancellationToken token);
        Task<User> GetUserAsync(string username, CancellationToken token);
        Task<User> GetUserByThirdPartyIdAsync(string thirdPartyId, CancellationToken token);
        Task InsertUserAsync(User user, CancellationToken token);
        Task UpdateUserAsync(User user, CancellationToken token);
        Task UpdateUserSettingsAsync(string username, IDictionary<string, string> settings, CancellationToken token);
        Task<bool> IsEmailAvailableAsync(string username, string email, CancellationToken token);
    }
}
