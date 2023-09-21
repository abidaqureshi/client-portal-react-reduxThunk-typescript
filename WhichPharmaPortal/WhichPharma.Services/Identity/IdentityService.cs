using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using UserDB = WhichPharma.Models.Database.Users.User;
using WhichPharma.Database.Services;
using WhichPharmaPortal.Models.Client;
using WhichPharma.Utils.Extensions;
using Mapster;
using WhichPharma.Database.Extensions;
using Microsoft.Extensions.Logging;
using WhichPharma.Services.GoogleServices;

namespace WhichPharma.Services.Identity
{
    public class IdentityService : IIdentityService
    {
        public const string Issuer = "WhichPharma.IdentityService";
        public const string Audience = "WhichPharma";

        private static readonly Regex _passwordStrengthRegex = new Regex(@"^(?=.*[A-Za-z])(?=.*\d).{4,}$");
        private static readonly Regex _usernameStrengthRegex = new Regex(@"^(?=.*[A-Za-z])[A-Za-z\d._\-@]{4,}$");

        private readonly ILogger<IdentityService> _logger;
        private readonly IIdentityServiceConfiguration _configuration;
        private readonly IUsersStorage _usersStorage;
        private readonly IGoogleService _googleService;

        public IdentityService(
            ILogger<IdentityService> logger, 
            IIdentityServiceConfiguration configuration, 
            IUsersStorage usersStorage,
            IGoogleService googleService)
        {
            _logger = logger;
            _configuration = configuration;
            _usersStorage = usersStorage;
            _googleService = googleService;
        }

        static IdentityService()
        {
            TypeAdapterConfig.GlobalSettings.NewConfig<UserDB, User>()
                .IgnoreNullValues(true)
                .Map(dest => dest.IsLinkedToThirdPartyLogin, src => src.ThirdPartyId != null)
                .Compile();
        }

        private string GetPasswordHash(string password)
        {
            var saltedString = password.Reverse() + password + _configuration.Secret;
            var hash = new SHA256Managed().ComputeHash(Encoding.UTF8.GetBytes(saltedString));
            return Convert.ToBase64String(hash);
        }

        private string GenerateJWT(UserDB user, DateTime expireDate, string thirdPartyProvider = null, string thirdPartyCode = null)
        {
            var key = Encoding.ASCII.GetBytes(_configuration.Secret);

            var claims = new List<Claim>();
            claims.Add(new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()));
            claims.Add(new Claim(ClaimTypes.Name, user.Username));
            claims.Add(new Claim(ClaimTypes.NameIdentifier, user.Username));
            if(!string.IsNullOrWhiteSpace(user.Email)) claims.Add(new Claim(ClaimTypes.Email, user.Email));
            claims.AddRange(user.Roles.Select(p => new Claim(ClaimTypes.Role, p)));
            if (!string.IsNullOrWhiteSpace(thirdPartyProvider)) claims.Add(new Claim(ClaimTypes.System, thirdPartyProvider));
            if (!string.IsNullOrWhiteSpace(thirdPartyCode)) claims.Add(new Claim(ClaimTypes.UserData, thirdPartyCode));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = expireDate,
                Issuer = Issuer,
                Audience = Audience,
                IssuedAt = DateTime.UtcNow,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateJwtSecurityToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        public string GenerateJWTForExternalUsers(string externalIdentifier, string email, DateTime expireDate)
        {
            var key = Encoding.ASCII.GetBytes(_configuration.Secret);

            var claims = new List<Claim>();
            claims.Add(new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()));
            claims.Add(new Claim(ClaimTypes.Name, externalIdentifier));
            claims.Add(new Claim(ClaimTypes.NameIdentifier, externalIdentifier));
            claims.Add(new Claim(ClaimTypes.Email, email));
            claims.Add(new Claim(ClaimTypes.Role, UserRole.External.ToString()));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = expireDate,
                Issuer = Issuer,
                Audience = Audience,
                IssuedAt = DateTime.UtcNow,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateJwtSecurityToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        public async Task<AuthenticatedUser> AuthenticateAsync(string username, string password, CancellationToken token)
        {
            username = username.Trim().ToLowerInvariant();

            var user = await _usersStorage.AuthorizeAndGetUserAsync(username, GetPasswordHash(password), token);

            return user == null ? null : new AuthenticatedUser
            {
                Username = user.Username,
                Roles = user.Roles.Select(role => (UserRole)Enum.Parse(typeof(UserRole), role)).ToArray(),
                AccessToken = GenerateJWT(user, DateTime.UtcNow.AddDays(1)),
                Settings = user.Settings,
                Email = user.Email,
                ImageUrl = user.ImageUrl,
            };
        }

        private static string GetThirdPartyId(string provider, string id) => $"{provider}-{id}";

        private async Task<ThirdPartyAccess> GetThirdPartyAccessInfoAsync(string provider, string code, CancellationToken token)
        {
            switch(provider)
            {
                case "google":
                    var user = await _googleService.GetUserProfileAsync(code, token);
                    return new ThirdPartyAccess
                    {
                        Provider = provider,
                        Code = code,
                        Id = user.Id,
                        Email = user.Email,
                        FirstName = user.GivenName,
                        LastName = user.FamilyName,
                        ImageUrl = user.Picture,
                    };
                default:
                    throw new NotImplementedException($"Third party provider not implemented: {provider}");
            };
        }

        public async Task<AuthenticatedUser> AuthenticateWithThirdPartyTokenAsync(string provider, string code, CancellationToken token)
        {
            var access = await GetThirdPartyAccessInfoAsync(provider, code, token);

            var thirdpartyId = GetThirdPartyId(access.Provider, access.Id);

            var user = await _usersStorage.GetUserByThirdPartyIdAsync(thirdpartyId, token);

            if (user == null)
            {
                _logger.LogWarning("Third party authentication user not found (ThirdPartyId: {ThirdPartyId}, Email: {Email})", thirdpartyId, access.Email);
                return null;
            }

            if(string.IsNullOrWhiteSpace(user.FirstName) || string.IsNullOrWhiteSpace(user.LastName) || string.IsNullOrWhiteSpace(user.Email) || string.IsNullOrWhiteSpace(user.ImageUrl))
            {
                user.FirstName = string.IsNullOrWhiteSpace(user.FirstName) ? access.FirstName : user.FirstName;
                user.LastName = string.IsNullOrWhiteSpace(user.LastName) ? access.LastName : user.LastName;
                user.Email = string.IsNullOrWhiteSpace(user.Email) ? access.Email : user.Email;
                user.ImageUrl = string.IsNullOrWhiteSpace(user.ImageUrl) ? access.ImageUrl : user.ImageUrl;

                await _usersStorage.UpdateUserAsync(user, token);
            }

            return new AuthenticatedUser
            {
                Username = user.Username,
                Roles = user.Roles.Select(role => (UserRole)Enum.Parse(typeof(UserRole), role)).ToArray(),
                Settings = user.Settings,
                Email = user.Email,
                AccessToken = GenerateJWT(user, DateTime.UtcNow.AddDays(1), access.Provider, access.Code),
                ImageUrl = user.ImageUrl,
            };
        }

        public async Task<UserChangeResult> CreateUserAsync(CreateUser user, CancellationToken token)
        {
            user.Username = user.Username.Trim().ToLowerInvariant();

            if (!_usernameStrengthRegex.IsMatch(user.Username))
            {
                return UserChangeResult.InvalidUsername;
            }

            if (!_passwordStrengthRegex.IsMatch(user.Password))
            {
                return UserChangeResult.WeakPassword;
            }

            if (!string.IsNullOrEmpty(user.Email) && !user.Email.IsValidEmail())
            {
                return UserChangeResult.InvalidEmail;
            }

            if (!string.IsNullOrEmpty(user.Email) && !await _usersStorage.IsEmailAvailableAsync(user.Username, user.Email, token))
            {
                return UserChangeResult.EmailInUse;
            }

            try
            {
                await _usersStorage.InsertUserAsync(new UserDB
                {
                    Username = user.Username,
                    Email = user.Email,
                    Password = GetPasswordHash(user.Password),
                    Roles = user.Roles.Select(r => r.ToString()).ToArray(),
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Title = user.Title,
                    StreakApiKey = user.StreakApiKey,
                }, 
                token);
            }
            catch (MongoWriteException)
            {
                return UserChangeResult.UsernameInUse;
            }

            return UserChangeResult.Created;
        }

        public async Task<UserChangeResult> UpdateUserAsync(string username, UpdateUser user, CancellationToken token)
        {
            if (string.IsNullOrWhiteSpace(user.Password))
            {
                user.Password = null;
            }

            if (user.Password != null && !_passwordStrengthRegex.IsMatch(user.Password))
            {
                return UserChangeResult.WeakPassword;
            }

            if (!string.IsNullOrEmpty(user.Email) && !user.Email.IsValidEmail())
            {
                return UserChangeResult.InvalidEmail;
            }

            if (!string.IsNullOrEmpty(user.Email) && !await _usersStorage.IsEmailAvailableAsync(username, user.Email, token))
            {
                return UserChangeResult.EmailInUse;
            }

            var dbUser = user.Adapt<UserDB>();

            dbUser.Username = username;
            dbUser.Password = user.Password == null ? null : GetPasswordHash(user.Password);

            await _usersStorage.UpdateUserAsync(dbUser, token);

            return UserChangeResult.Updated;
        }

        public async  Task<UserChangeResult> UpdateUserThirdPartyLinkAsync(string username, string provider, string id, CancellationToken token)
        {
            var thirdPartyId = GetThirdPartyId(provider, id);

            var user = await _usersStorage.GetUserByThirdPartyIdAsync(thirdPartyId, token);

            if(user != null)
            {
                return UserChangeResult.UsernameInUse;
            }

            var dbUser =  new UserDB
            {
                Username = username,
                ThirdPartyId = thirdPartyId,
            };

            await _usersStorage.UpdateUserAsync(dbUser, token);

            return UserChangeResult.Updated;
        }

        public Task<IEnumerable<User>> GetAllUsersAsync(CancellationToken token)
        {
            return _usersStorage.GetAllUsersAsync(token).Select(users => users.Select(u => u.Adapt<User>()));
        }

        public Task<User> GetUserAsync(string username, CancellationToken token)
        {
            return _usersStorage.GetUserAsync(username, token).Select(dbUser => dbUser.Adapt<User>());
        }

        public Task UpdateCustomSettingsAsync(string username, IDictionary<string, string> settings, CancellationToken token)
        {
            return _usersStorage.UpdateUserSettingsAsync(username, settings, token);
        }
    }
}
