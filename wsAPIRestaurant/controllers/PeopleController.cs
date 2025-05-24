using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace RestaurantReservationAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PeopleController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PeopleController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/People
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PersonDto>>> GetPeople(
            [FromQuery] bool? isReservable = null,
            [FromQuery] bool? isAttendable = null)
        {
            var query = _context.People.AsQueryable();

            if (isReservable.HasValue)
                query = query.Where(p => p.IsReservable == isReservable.Value);
            
            if (isAttendable.HasValue)
                query = query.Where(p => p.IsAttendable == isAttendable.Value);

            var people = await query.ToListAsync();
            
            var peopleDtos = people.Select(p => new PersonDto
            {
                Id = p.Id,
                Name = p.Name,
                Email = p.Email,
                IsReservable = p.IsReservable,
                IsAttendable = p.IsAttendable
            }).ToList();

            return Ok(peopleDtos);
        }

        // GET: api/People/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<PersonDto>> GetPerson(string id)
        {
            var person = await _context.People.FindAsync(id);
            if (person == null)
                return NotFound();

            var personDto = new PersonDto
            {
                Id = person.Id,
                Name = person.Name,
                Email = person.Email,
                IsReservable = person.IsReservable,
                IsAttendable = person.IsAttendable
            };

            return Ok(personDto);
        }

        // POST: api/People
        [HttpPost]
        public async Task<ActionResult<PersonDto>> PostPerson(PersonCreateUpdateDto personDto)
        {
            var person = new Person
            {
                Name = personDto.Name,
                Email = personDto.Email,
                IsReservable = personDto.IsReservable,
                IsAttendable = personDto.IsAttendable
            };

            _context.People.Add(person);
            await _context.SaveChangesAsync();

            var resultDto = new PersonDto
            {
                Id = person.Id,
                Name = person.Name,
                Email = person.Email,
                IsReservable = person.IsReservable,
                IsAttendable = person.IsAttendable
            };

            return CreatedAtAction(nameof(GetPerson), new { id = person.Id }, resultDto);
        }

        // PUT: api/People/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPerson(string id, PersonCreateUpdateDto personDto)
        {
            var person = await _context.People.FindAsync(id);
            if (person == null)
                return NotFound();

            person.Name = personDto.Name;
            person.Email = personDto.Email;
            person.IsReservable = personDto.IsReservable;
            person.IsAttendable = personDto.IsAttendable;

            _context.Entry(person).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.People.Any(e => e.Id == id))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE: api/People/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePerson(string id)
        {
            var person = await _context.People.FindAsync(id);
            if (person == null)
                return NotFound();

            _context.People.Remove(person);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}