namespace RestaurantApi.Models.Dtos
{
    public enum UserRole
    {
        Consulta,
        Gestion
    }

    public class UserDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string? Email { get; set; } // Nullable
        public UserRole Role { get; set; }
    }
}
