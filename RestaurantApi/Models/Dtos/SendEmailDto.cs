using System.ComponentModel.DataAnnotations;

namespace RestaurantApi.Models.Dtos
{
    public class SendEmailDto
    {
        [Required]
        [EmailAddress]
        public string To { get; set; }
        [Required]
        public string Subject { get; set; } // Added Subject as it's standard
        [Required]
        public string HtmlBody { get; set; }
    }
}
