using Microsoft.AspNetCore.Mvc;
using RestaurantApi.Models.Dtos;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace RestaurantApi.Controllers
{
    [ApiController]
    [Route("api/email")]
    [Authorize] // All endpoints require authentication
    public class EmailController : ControllerBase
    {
        // TODO: Inject an IEmailService or use a library like SendGrid, MailKit, etc.

        [HttpPost("send")]
        [ProducesResponseType(202)] // Accepted
        [ProducesResponseType(typeof(ValidationProblemDetails), 400)]
        public async Task<IActionResult> SendEmail([FromBody] SendEmailDto emailDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // TODO: Implement the actual email sending logic here using the injected service.
            // For example:
            // var success = await _emailService.SendHtmlEmailAsync(emailDto.To, "Confirmació de Reserva", emailDto.HtmlBody);
            // if (!success) { /* Handle error, maybe return 500 or a specific error DTO */ }
            
            // As per user spec, the C# function for actual sending is external.
            // This API endpoint's job is to receive the request.
            // For now, we just simulate acceptance.
            await Task.Delay(50); // Simulate async work

            return Accepted(new { message = "Solicitud de envío de correo recibida y siendo procesada." });
        }
    }
}
