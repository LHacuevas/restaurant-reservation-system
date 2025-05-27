using Microsoft.AspNetCore.Mvc;
using RestaurantApi.Models.Dtos;
// Assuming an Authentication service/handler sets User.Identity
// For roles, you might use [Authorize(Roles = "Gestion")] or custom policy
using Microsoft.AspNetCore.Authorization; // For [Authorize]

namespace RestaurantApi.Controllers
{
    [ApiController]
    [Route("api/user")]
    [Authorize] // All endpoints in this controller require authentication
    public class UserController : ControllerBase
    {
        // TODO: Inject a service to get user details, e.g., IUserService
        // For demonstration, returning a hardcoded UserDto
        // In a real app, this would fetch based on User.Identity.Name or similar
        
        [HttpGet("me")]
        [ProducesResponseType(typeof(UserDto), 200)]
        [ProducesResponseType(401)] 
        [ProducesResponseType(404)]
        public IActionResult GetCurrentUser()
        {
            // TODO: Replace with actual logic to get current user details and role
            // This is placeholder logic.
            var userId = User.Identity?.Name; // Example: Get user ID from token claims
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(); // Should not happen if [Authorize] works
            }

            // Dummy data - replace with service call
            var user = new UserDto 
            { 
                Id = userId, 
                Name = "Current User Placeholder", // Fetch actual name
                Email = "user@example.com",       // Fetch actual email
                Role = UserRole.Gestion // TODO: Determine role based on userId or claims
            };

            if (user == null)
            {
                return NotFound("User not found.");
            }
            return Ok(user);
        }
    }
}
