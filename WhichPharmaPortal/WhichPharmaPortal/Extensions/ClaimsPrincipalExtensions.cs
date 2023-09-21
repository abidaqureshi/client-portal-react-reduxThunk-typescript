using System.Security.Claims;

namespace WhichPharmaPortal.Extensions
{
    /// <summary>
    /// User ClaimsPrincipal extensions.
    /// <seealso cref="Microsoft.AspNetCore.Mvc.ControllerBase.User"/>
    /// </summary>
    public static class ClaimsPrincipalExtensions
    {
        /// <summary>
        /// Gets username from token claims
        /// </summary>
        public static string GetUsername(this ClaimsPrincipal user) => user.FindFirstValue(ClaimTypes.NameIdentifier);

        /// <summary>
        /// Gets user identifier from token claims
        /// </summary>
        public static string GetUserIdentifier(this ClaimsPrincipal user) => user.FindFirstValue(ClaimTypes.NameIdentifier);

        /// <summary>
        /// Gets user email from token claims
        /// </summary>
        public static string GetUserEmail(this ClaimsPrincipal user) => user.FindFirstValue(ClaimTypes.Email);
    }
}
