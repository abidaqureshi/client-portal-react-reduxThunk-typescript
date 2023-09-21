using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WhichPharmaPortal.Models.Client;
using WhichPharma.Services.Identity;
using WhichPharmaPortal.Extensions;
using WhichPharma.Services.RFQs;
using WhichPharma.Services.Suppliers;
using WhichPharma.Services.Email;

namespace WhichPharmaPortal.Controllers
{
    /// <summary>
    /// Users management
    /// </summary>
    [ApiController]
    [Route("v1/users")]
    [Produces("application/json")]
    [ProducesErrorResponseType(typeof(void))]
    public class UsersController : ControllerBase
    {
        private readonly ILogger<UsersController> _logger;
        private readonly IIdentityService _identityService;

        /// <summary>
        /// Users controller
        /// </summary>
        public UsersController(IIdentityService identityService, ILogger<UsersController> logger)
        {
            _identityService = identityService;
            _logger = logger;
        }

        /// <summary>
        /// Authenticate user. Get the corresponding authentication token
        /// </summary>
        /// <response code="200">Success - Returns the authenticated user data</response>
        /// <response code="400">BadRequest - Username was not found or password is invalid</response> 
        [AllowAnonymous]
        [HttpPost("authenticate")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(AuthenticatedUser))]
        public async Task<IActionResult> Authenticate([FromBody] Login login, CancellationToken token)
        {
            AuthenticatedUser user;

            if (login.ThirdPartyProvider != null && login.ThirdPartyCode != null)
            {
                user = await _identityService.AuthenticateWithThirdPartyTokenAsync(login.ThirdPartyProvider, login.ThirdPartyCode, token);

                _logger.LogDebug("ThirdParty Authentication", new
                {
                    login.ThirdPartyProvider,
                    login.ThirdPartyCode,
                    Success = user != null,
                });
            }
            else
            {
                user = await _identityService.AuthenticateAsync(login.Username, login.Password, token);

                _logger.LogDebug("Authentication", new
                {
                    user?.Username,
                    Success = user != null,
                });
            }

            if (user == null)
            {
                return BadRequest();
            }

            return Ok(user);
        }

        /// <summary>
        /// Request an access link.
        /// </summary>
        /// <response code="200">Success - Request link successfully sent to email</response>
        /// <response code="400">BadRequest - Invalid email, no Supplier found</response> 
        [AllowAnonymous]
        [HttpPost("accessLinkRequest")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(AuthenticatedUser))]
        public async Task<IActionResult> RequestAccessLink(
            [FromBody] RequestAccessLink request,
            [FromServices] IRFQService rfqService,
            CancellationToken token)
        {
            if (string.IsNullOrWhiteSpace(request?.Email)) return BadRequest();

            if (await rfqService.SendExternalAccessLinkEmailAsync(request.Email, token))
            {
                return Ok();
            }
            else
            {
                return BadRequest();
            }
        }

        /// <summary>
        /// Get my user
        /// </summary>
        /// <response code="200">Success - Returns the user infomation</response>
        /// <response code="401">Unauthorized - Authorization token invalid or expired</response>
        [HttpGet("me")]
        [Authorize(Roles = Roles.AllExceptExternal)]
        [Produces("application/json")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(User))]
        public async Task<User> GetMyUser(CancellationToken token)
        {
            var username = User.GetUsername();

            var result = await _identityService.GetUserAsync(username, token);

            _logger.LogDebug("My user got");

            return result;
        }

        /// <summary>
        /// Update my User data
        /// </summary>
        /// <param name="model">Request body model</param>
        /// <param name="token">Cancellation token</param>
        /// <response code="200">Success - User updated</response>
        /// <response code="400">BadRequest - Request body is invalid</response> 
        /// <response code="401">Unauthorized - Authorization token invalid or expired</response>         
        /// <response code="403">Forbidden - User has no roles with permission to access this endpoint</response>   
        [HttpPut("me")]
        [Authorize(Roles = Roles.AllExceptExternal)]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ResultModel<UserChangeResult>))]
        public async Task<IActionResult> Update([FromBody] UpdateUser model, CancellationToken token)
        {
            var username = User.GetUsername();

            var result = await _identityService.UpdateUserAsync(username, model, token);

            _logger.LogDebug("My user update", new
            {
                username,
                model.Roles,
                Result = result.ToString(),
            });

            if (result != UserChangeResult.Updated)
            {
                return BadRequest(new ResultModel<UserChangeResult> { Result = result });
            }

            return Ok();
        }
        /// <summary>
        /// Link my user with a third party account (e.g. Google)
        /// </summary>
        /// <param name="model">Request body model</param>
        /// <param name="token">Cancellation token</param>
        /// <response code="200">Success - User updated</response>
        /// <response code="400">BadRequest - Request body is invalid</response> 
        /// <response code="401">Unauthorized - Authorization token invalid or expired</response>         
        /// <response code="403">Forbidden - User has no roles with permission to access this endpoint</response>   
        [HttpPut("me/thirdpartylink")]
        [Authorize(Roles = Roles.AllExceptExternal)]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ResultModel<UserChangeResult>))]
        public async Task<IActionResult> LinkToThirdParty([FromBody] ThirdPartyAccess model, CancellationToken token)
        {
            var username = User.GetUsername();

            var result = await _identityService.UpdateUserThirdPartyLinkAsync(username, model.Provider, model.Id, token);

            _logger.LogDebug("Link user with thirdparty account", new
            {
                username,
                model.Id,
                model.Provider,
                Result = result.ToString(),
            });

            if (result != UserChangeResult.Updated)
            {
                return BadRequest(new ResultModel<UserChangeResult> { Result = result });
            }

            return Ok();
        }

        /// <summary>
        /// Get the list of all users (Administrator role required)
        /// </summary>
        /// <response code="200">Success - Returns the list of users</response>
        /// <response code="401">Unauthorized - Authorization token invalid or expired</response>         
        /// <response code="403">Forbidden - User has no roles with permission to access this endpoint</response>   
        [HttpGet]
        [Authorize(Roles = Roles.Administrator)]
        [Produces("application/json")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<User>))]
        public async Task<IEnumerable<User>> GetAllUsers(CancellationToken token)
        {
            var result = await _identityService.GetAllUsersAsync(token);

            _logger.LogDebug("All users got", new
            {
                Count = result.Count(),
            });

            return result;
        }

        /// <summary>
        /// Create User (Administrator role required)
        /// </summary>
        /// <response code="200">Success - User created</response>
        /// <response code="400">BadRequest - Request body is invalid</response> 
        /// <response code="401">Unauthorized - Authorization token invalid or expired</response>         
        /// <response code="403">Forbidden - User has no roles with permission to access this endpoint</response>   
        [HttpPost]
        [Authorize(Roles = Roles.Administrator)]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ResultModel<UserChangeResult>))]
        public async Task<IActionResult> Create([FromBody] CreateUser model, CancellationToken token)
        {
            var result = await _identityService.CreateUserAsync(model, token);

            _logger.LogDebug("User creation", new
            {
                model.Username,
                model.Roles,
                Result = result.ToString(),
            });

            if (result != UserChangeResult.Created)
            {
                return BadRequest(new ResultModel<UserChangeResult> { Result = result });
            }

            return Ok();
        }

        /// <summary>
        /// Update User data (Administrator role required)
        /// </summary>
        /// <param name="username">Username</param>
        /// <param name="model">Request body model</param>
        /// <param name="token">Cancellation token</param>
        /// <response code="200">Success - User updated</response>
        /// <response code="400">BadRequest - Request body is invalid or username wasn't found</response> 
        /// <response code="401">Unauthorized - Authorization token invalid or expired</response>         
        /// <response code="403">Forbidden - User has no roles with permission to access this endpoint</response>   
        [HttpPut("{username}")]
        [Authorize(Roles = Roles.Administrator)]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ResultModel<UserChangeResult>))]
        public async Task<IActionResult> Update([FromRoute] string username, [FromBody] UpdateUser model, CancellationToken token)
        {
            var result = await _identityService.UpdateUserAsync(username, model, token);

            _logger.LogDebug("User update", new
            {
                username,
                model.Roles,
                Result = result.ToString(),
            });

            if (result != UserChangeResult.Updated)
            {
                return BadRequest(new ResultModel<UserChangeResult> { Result = result });
            }

            return Ok();
        }

        /// <summary>
        /// Update User custom settings
        /// </summary>
        /// <param name="settings">User custom settings</param>
        /// <param name="token">Cancellation token</param>
        /// <response code="200">Success - User custom settings updated</response>
        /// <response code="401">Unauthorized - Authorization token invalid or expired</response>         
        [HttpPut("me/settings")]
        [Authorize(Roles = Roles.AllExceptExternal)]
        public async Task<IActionResult> UpdateCustomSettings([FromBody] IDictionary<string, dynamic> settings, CancellationToken token)
        {
            var username = User.GetUsername();

            await _identityService.UpdateCustomSettingsAsync(username, settings.ToDictionary(pair => pair.Key, pair => pair.Value.ToString() as string), token);

            _logger.LogDebug("User custom settings update", new
            {
                username,
                settings,
            });

            return Ok();
        }

        /// <summary>
        /// Get collaborators (Administrator or Collaborator roles required)
        /// </summary>
        /// <response code="200">Success - Returns the list of users</response>
        /// <response code="401">Unauthorized - Authorization token invalid or expired</response>         
        /// <response code="403">Forbidden - User has no roles with permission to access this endpoint</response>   
        [HttpGet("collaborators")]
        [Authorize(Roles = Roles.AdministratorOrCollaborator)]
        [Produces("application/json")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<User>))]
        public async Task<IEnumerable<User>> GetCollaborators(CancellationToken token)
        {
            var result = (await _identityService.GetAllUsersAsync(token))
                .Where(u => u.Roles.Contains(UserRole.Collaborator))
                .Select(u => new User
                {
                    Username = u.Username,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Roles = u.Roles,
                    ImageUrl = u.ImageUrl,
                });

            _logger.LogDebug("Assignable users got", new
            {
                Count = result.Count(),
            });

            return result;
        }
    }
}
