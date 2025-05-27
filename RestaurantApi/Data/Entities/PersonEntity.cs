using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using RestaurantApi.Models.Dtos; // For UserRole enum, assuming Dtos are in a sibling namespace

namespace RestaurantApi.Data.Entities
{
    public class PersonEntity
    {
        [Key]
        public string Id { get; set; } // GUID as string

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(100)]
        public string? Email { get; set; }

        public UserRole? Role { get; set; } // Nullable if not all persons are users

        // Navigation properties for EF Core relationships
        public virtual ICollection<ReservationEntity> ReservationsMade { get; set; } = new List<ReservationEntity>();
        public virtual ICollection<AttendeeEntity> ReservationAttendances { get; set; } = new List<AttendeeEntity>();
    }
}
