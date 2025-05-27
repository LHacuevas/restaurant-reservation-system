using System.Collections.Generic;
using System.ComponentModel.DataAnnotations; // For basic validation attributes

namespace RestaurantApi.Models.Dtos
{
    public class CreateReservationDto
    {
        [Required]
        public string TableId { get; set; }
        [Required]
        public string Date { get; set; } // YYYY-MM-DD
        [Required]
        public string ReservedById { get; set; }
        [Required]
        public List<string> AttendeePersonIds { get; set; }
        public bool? IsClosedByUser { get; set; } // Nullable, defaults to false in backend
        public string? Notes { get; set; } // Nullable
    }
}
