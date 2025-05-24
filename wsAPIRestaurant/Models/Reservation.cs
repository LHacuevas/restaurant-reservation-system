
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Reservation
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        public string TableId { get; set; } = string.Empty;
        
        [Required]
        public string Date { get; set; } = string.Empty; // "YYYY-MM-DD"
        
        [Required]
        public string ReservedById { get; set; } = string.Empty;
        
        [Required]
        public string AttendeeIdsJSON { get; set; } = "[]";
        
        public bool IsClosedByUser { get; set; } = false;
        
        public string? Notes { get; set; }
        
        public bool IsCancelled { get; set; } = false;
        
        public string? CancellationReason { get; set; }
        
        public DateTime? CancelledAt { get; set; }
        
        public bool SendEmailNotification { get; set; } = false;
        
        public string? CustomEmailMessage { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }