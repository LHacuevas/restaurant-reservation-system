using System.ComponentModel.DataAnnotations;

namespace RestaurantApi.Models.Dtos
{
    public class DailyServiceDayConfigDto
    {
        [Required]
        public string Date { get; set; } // YYYY-MM-DD
        public bool IsActive { get; set; }
        public int FourSeaterTables { get; set; }
        public int SixSeaterTables { get; set; }
    }
}
