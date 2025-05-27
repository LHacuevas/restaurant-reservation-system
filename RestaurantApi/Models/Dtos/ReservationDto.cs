using System.Collections.Generic;

namespace RestaurantApi.Models.Dtos
{
    public class ReservationDto
    {
        public string Id { get; set; }
        public string TableId { get; set; }
        public string? TableName { get; set; } // Nullable
        public string Date { get; set; } // Consider using DateTime in C# but string for DTO if YYYY-MM-DD is strict
        public string ReservedById { get; set; }
        public string? ReservedByName { get; set; } // Nullable
        public List<AttendeeInfoDto> Attendees { get; set; }
        public bool IsClosedByUser { get; set; }
        public string? Notes { get; set; } // Nullable
        public string? CancellationReason { get; set; } // Nullable
    }
}
