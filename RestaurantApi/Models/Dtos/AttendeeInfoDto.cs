namespace RestaurantApi.Models.Dtos
{
    public class AttendeeInfoDto
    {
        public string PersonId { get; set; }
        public string? Name { get; set; } // Nullable, for convenience
        public bool Attended { get; set; }
    }
}
