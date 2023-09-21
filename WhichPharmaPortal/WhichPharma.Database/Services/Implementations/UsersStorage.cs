using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Database.Config;
using WhichPharma.Database.Utils;
using WhichPharma.Models.Database.Users;

namespace WhichPharma.Database.Services.Implementations
{
    public class UsersStorage : IUsersStorage
    {
        private const string _collectionName = "users";
        private readonly IMongoCollection<User> _collection;

        public UsersStorage(IStorageConfig<UsersStorage> config)
        {
            _collection = new MongoClient(config.ConnectionString).GetDatabase(config.DatabaseName).GetCollection<User>(_collectionName);
        }

        public Task<List<User>> GetAllUsersAsync(CancellationToken token)
        {
            return _collection.Find(Builders<User>.Filter.Empty).ToListAsync(token);
        }

        public Task<User> AuthorizeAndGetUserAsync(string username, string password, CancellationToken token)
        {
            if (username.Contains('@'))
            {
                return _collection.Find(u => u.Email == username && u.Password == password).SingleOrDefaultAsync(token);
            }
            else
            {
                return _collection.Find(u => u.Username == username && u.Password == password).SingleOrDefaultAsync(token);
            }
        }

        public Task<User> GetUserAsync(string username, CancellationToken token)
        {
            return _collection.Find(u => u.Username == username).SingleOrDefaultAsync(token);
        }

        public Task<User> GetUserByThirdPartyIdAsync(string thirdPartyId, CancellationToken token)
        {
            return _collection.Find(u => u.ThirdPartyId == thirdPartyId).SingleOrDefaultAsync(token);
        }

        public Task InsertUserAsync(User user, CancellationToken token)
        {
            return _collection.InsertOneAsync(user, cancellationToken: token);
        }

        public Task UpdateUserAsync(User user, CancellationToken token)
        {
            var update = new DynamicUpdateBuilder<User>()
                .SetIfNotNull(user => user.Email, user.Email)
                .SetIfNotNull(user => user.Roles, user.Roles)
                .SetIfNotNull(user => user.Password, user.Password)
                .SetIfNotNull(user => user.FirstName, user.FirstName)
                .SetIfNotNull(user => user.LastName, user.LastName)
                .SetIfNotNull(user => user.Title, user.Title)
                .SetIfNotNull(user => user.StreakApiKey, user.StreakApiKey)
                .SetIfNotNull(user => user.ImageUrl, user.ImageUrl)
                .SetIfNotNull(user => user.ImageBytes, user.ImageBytes)
                .SetIfNotNull(user => user.ThirdPartyId, user.ThirdPartyId)
                .Build();

            return _collection.UpdateOneAsync(u => u.Username == user.Username, update, cancellationToken: token);
        }

        public Task UpdateUserSettingsAsync(string username, IDictionary<string, string> settings, CancellationToken token)
        {
            var updates = settings.Select(setting => Builders<User>.Update.Set($"{nameof(User.Settings)}.{setting.Key}", setting.Value));

            return _collection.UpdateOneAsync(
                u => u.Username == username,
                Builders<User>.Update.Combine(updates),
                new UpdateOptions { IsUpsert = false },
                token);
        }

        public async Task<bool> IsEmailAvailableAsync(string username, string email, CancellationToken token)
        {
            var found = await _collection.Find(u => u.Username != username && u.Email == email).SingleOrDefaultAsync(token);
            return found == null;
        }
    }
}
