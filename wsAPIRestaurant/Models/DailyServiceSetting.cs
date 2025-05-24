using System.ComponentModel.DataAnnotations;

public class DailyServiceSetting
    {
        [Key]
        public string Date { get; set; } = string.Empty; // "YYYY-MM-DD"
        
        [Required]
        public bool IsActive { get; set; }
        
        [Required]
        public int FourSeaterTables { get; set; }
        
        [Required]
        public int SixSeaterTables { get; set; }
        
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }