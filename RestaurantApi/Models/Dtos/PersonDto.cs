namespace RestaurantApi.Models.Dtos
{
    // Re-using UserRole from UserDto.cs, assuming they are in the same assembly/namespace context for DTOs
    // If not, UserRole might need to be defined here or in a shared DTO location.
    public class PersonDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string? Email { get; set; } // Nullable
        public UserRole? Role { get; set; } // Nullable, as not all persons might be users with roles
    }
}
