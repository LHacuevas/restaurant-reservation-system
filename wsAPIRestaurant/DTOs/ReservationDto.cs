// DTOs/ReservationDto.cs
public class ReservationDto
    {
        public string Id { get; set; } = string.Empty;
        public string TableId { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public string ReservedById { get; set; } = string.Empty;
        public List<string> AttendeeIds { get; set; } = new();
        public bool IsClosedByUser { get; set; }
        public string? Notes { get; set; }
        public bool IsCancelled { get; set; }
        public string? CancellationReason { get; set; }
        public DateTime? CancelledAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class ReservationCreateUpdateDto
    {
        public string TableId { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public string ReservedById { get; set; } = string.Empty;
        public List<string> AttendeeIds { get; set; } = new();
        public bool IsClosedByUser { get; set; } = false;
        public string? Notes { get; set; }
        public bool SendEmailNotification { get; set; } = false;
        public string? CustomEmailMessage { get; set; }
    }
