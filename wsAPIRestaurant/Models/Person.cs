// Models/Person.cs
using System.ComponentModel.DataAnnotations;

public class Person
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string? Email { get; set; }
        
        public bool IsReservable { get; set; } = false;
        
        public bool IsAttendable { get; set; } = true;
    }
