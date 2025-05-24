using System.ComponentModel.DataAnnotations;

public class DefaultConfiguration
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int FourSeaterTables { get; set; }
        
        [Required]
        public int SixSeaterTables { get; set; }
        
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
