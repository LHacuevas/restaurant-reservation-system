using System.Collections.Generic;

namespace RestaurantApi.Models.Dtos
{
    public class UpdateReservationDto
    {
        public string? TableId { get; set; }
        public string? Date { get; set; } // YYYY-MM-DD
        public string? ReservedById { get; set; }
        public List<AttendeeInfoDto>? Attendees { get; set; }
        public bool? IsClosedByUser { get; set; }
        public string? Notes { get; set; }
    }
}
