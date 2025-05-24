 public class PersonDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public bool IsReservable { get; set; }
        public bool IsAttendable { get; set; }
    }

    public class PersonCreateUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public bool IsReservable { get; set; } = false;
        public bool IsAttendable { get; set; } = true;
    }