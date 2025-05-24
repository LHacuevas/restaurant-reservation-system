using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;


namespace RestaurantReservationAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReservationsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Reservations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReservationDto>>> GetReservations(
            [FromQuery] string? date,
            [FromQuery] string? reservedById,
            [FromQuery] string? attendeeId,
            [FromQuery] bool includeCancelled = false)
        {
            var query = _context.Reservations.AsQueryable();

            if (!includeCancelled)
                query = query.Where(r => !r.IsCancelled);
            
            if (!string.IsNullOrEmpty(date))
                query = query.Where(r => r.Date == date);
            
            if (!string.IsNullOrEmpty(reservedById))
                query = query.Where(r => r.ReservedById == reservedById);

            var reservations = await query.ToListAsync();

            if (!string.IsNullOrEmpty(attendeeId))
            {
                reservations = reservations.Where(r =>
                    JsonSerializer.Deserialize<List<string>>(r.AttendeeIdsJSON)?.Contains(attendeeId) ?? false
                ).ToList();
            }

            var reservationDtos = reservations.Select(r => new ReservationDto
            {
                Id = r.Id,
                TableId = r.TableId,
                Date = r.Date,
                ReservedById = r.ReservedById,
                AttendeeIds = JsonSerializer.Deserialize<List<string>>(r.AttendeeIdsJSON) ?? new List<string>(),
                IsClosedByUser = r.IsClosedByUser,
                Notes = r.Notes,
                IsCancelled = r.IsCancelled,
                CancellationReason = r.CancellationReason,
                CancelledAt = r.CancelledAt,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt
            }).ToList();

            return Ok(reservationDtos);
        }

        // GET: api/Reservations/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ReservationDto>> GetReservation(string id)
        {
            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null)
                return NotFound();

            var dto = new ReservationDto
            {
                Id = reservation.Id,
                TableId = reservation.TableId,
                Date = reservation.Date,
                ReservedById = reservation.ReservedById,
                AttendeeIds = JsonSerializer.Deserialize<List<string>>(reservation.AttendeeIdsJSON) ?? new List<string>(),
                IsClosedByUser = reservation.IsClosedByUser,
                Notes = reservation.Notes,
                IsCancelled = reservation.IsCancelled,
                CancellationReason = reservation.CancellationReason,
                CancelledAt = reservation.CancelledAt,
                CreatedAt = reservation.CreatedAt,
                UpdatedAt = reservation.UpdatedAt
            };

            return Ok(dto);
        }

        // POST: api/Reservations
        [HttpPost]
        public async Task<ActionResult<ReservationDto>> PostReservation(ReservationCreateUpdateDto reservationDto)
        {
            // Validar que la persona que reserva existe
            var reservedBy = await _context.People.FindAsync(reservationDto.ReservedById);
            if (reservedBy == null || !reservedBy.IsReservable)
                return BadRequest("La persona que hace la reserva no existe o no puede reservar.");

            // Validar que todos los asistentes existen y pueden asistir
            var attendeeIds = reservationDto.AttendeeIds ?? new List<string>();
            var attendees = await _context.People.Where(p => attendeeIds.Contains(p.Id)).ToListAsync();
            
            if (attendees.Count != attendeeIds.Count)
                return BadRequest("Algunos asistentes no existen.");
            
            if (attendees.Any(a => !a.IsAttendable))
                return BadRequest("Algunos asistentes no pueden asistir.");

            var reservation = new Reservation
            {
                TableId = reservationDto.TableId,
                Date = reservationDto.Date,
                ReservedById = reservationDto.ReservedById,
                AttendeeIdsJSON = JsonSerializer.Serialize(attendeeIds),
                IsClosedByUser = reservationDto.IsClosedByUser,
                Notes = reservationDto.Notes,
                SendEmailNotification = reservationDto.SendEmailNotification,
                CustomEmailMessage = reservationDto.CustomEmailMessage,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            // TODO: Aquí iría la lógica de envío de email si SendEmailNotification es true

            var resultDto = new ReservationDto
            {
                Id = reservation.Id,
                TableId = reservation.TableId,
                Date = reservation.Date,
                ReservedById = reservation.ReservedById,
                AttendeeIds = attendeeIds,
                IsClosedByUser = reservation.IsClosedByUser,
                Notes = reservation.Notes,
                IsCancelled = reservation.IsCancelled,
                CreatedAt = reservation.CreatedAt,
                UpdatedAt = reservation.UpdatedAt
            };

            return CreatedAtAction(nameof(GetReservation), new { id = reservation.Id }, resultDto);
        }

        // PUT: api/Reservations/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutReservation(string id, ReservationCreateUpdateDto reservationDto)
        {
            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null || reservation.IsCancelled)
                return NotFound();

            // Validaciones similares al POST
            var reservedBy = await _context.People.FindAsync(reservationDto.ReservedById);
            if (reservedBy == null || !reservedBy.IsReservable)
                return BadRequest("La persona que hace la reserva no existe o no puede reservar.");

            var attendeeIds = reservationDto.AttendeeIds ?? new List<string>();
            var attendees = await _context.People.Where(p => attendeeIds.Contains(p.Id)).ToListAsync();
            
            if (attendees.Count != attendeeIds.Count)
                return BadRequest("Algunos asistentes no existen.");
            
            if (attendees.Any(a => !a.IsAttendable))
                return BadRequest("Algunos asistentes no pueden asistir.");

            reservation.TableId = reservationDto.TableId;
            reservation.Date = reservationDto.Date;
            reservation.ReservedById = reservationDto.ReservedById;
            reservation.AttendeeIdsJSON = JsonSerializer.Serialize(attendeeIds);
            reservation.IsClosedByUser = reservationDto.IsClosedByUser;
            reservation.Notes = reservationDto.Notes;
            reservation.SendEmailNotification = reservationDto.SendEmailNotification;
            reservation.CustomEmailMessage = reservationDto.CustomEmailMessage;
            reservation.UpdatedAt = DateTime.UtcNow;

            _context.Entry(reservation).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                // TODO: Lógica de envío de email si se actualiza
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Reservations.Any(e => e.Id == id))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Reservations/{id} (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReservation(string id, [FromQuery] string? reason)
        {
            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null)
                return NotFound();
            
            if (reservation.IsCancelled)
                return Ok("La reserva ya estaba cancelada.");

            reservation.IsCancelled = true;
            reservation.CancellationReason = reason ?? "Motivo no especificado";
            reservation.CancelledAt = DateTime.UtcNow;
            reservation.UpdatedAt = DateTime.UtcNow;

            _context.Entry(reservation).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}