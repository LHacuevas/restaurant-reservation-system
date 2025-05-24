using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace RestaurantReservationAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConfigurationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ConfigurationController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Configuration/default
        [HttpGet("default")]
        public async Task<ActionResult<DefaultConfigurationDto>> GetDefaultConfiguration()
        {
            var config = await _context.DefaultConfigurations.FirstOrDefaultAsync();
            if (config == null)
                return NotFound();

            var dto = new DefaultConfigurationDto
            {
                Id = config.Id,
                FourSeaterTables = config.FourSeaterTables,
                SixSeaterTables = config.SixSeaterTables,
                LastUpdated = config.LastUpdated
            };

            return Ok(dto);
        }

        // PUT: api/Configuration/default
        [HttpPut("default")]
        public async Task<IActionResult> UpdateDefaultConfiguration(DefaultConfigurationCreateUpdateDto configDto)
        {
            var config = await _context.DefaultConfigurations.FirstOrDefaultAsync();
            if (config == null)
            {
                config = new DefaultConfiguration
                {
                    FourSeaterTables = configDto.FourSeaterTables,
                    SixSeaterTables = configDto.SixSeaterTables,
                    LastUpdated = DateTime.UtcNow
                };
                _context.DefaultConfigurations.Add(config);
            }
            else
            {
                config.FourSeaterTables = configDto.FourSeaterTables;
                config.SixSeaterTables = configDto.SixSeaterTables;
                config.LastUpdated = DateTime.UtcNow;
                _context.Entry(config).State = EntityState.Modified;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // GET: api/Configuration/daily/{date}
        [HttpGet("daily/{date}")]
        public async Task<ActionResult<DailyServiceSettingDto>> GetDailyServiceSetting(string date)
        {
            var setting = await _context.DailyServiceSettings.FindAsync(date);
            if (setting == null)
                return NotFound();

            var dto = new DailyServiceSettingDto
            {
                Date = setting.Date,
                IsActive = setting.IsActive,
                FourSeaterTables = setting.FourSeaterTables,
                SixSeaterTables = setting.SixSeaterTables,
                LastUpdated = setting.LastUpdated
            };

            return Ok(dto);
        }

        // PUT: api/Configuration/daily/{date}
        [HttpPut("daily/{date}")]
        public async Task<IActionResult> UpdateDailyServiceSetting(string date, DailyServiceSettingCreateUpdateDto settingDto)
        {
            var setting = await _context.DailyServiceSettings.FindAsync(date);
            if (setting == null)
            {
                setting = new DailyServiceSetting
                {
                    Date = date,
                    IsActive = settingDto.IsActive,
                    FourSeaterTables = settingDto.FourSeaterTables,
                    SixSeaterTables = settingDto.SixSeaterTables,
                    LastUpdated = DateTime.UtcNow
                };
                _context.DailyServiceSettings.Add(setting);
            }
            else
            {
                setting.IsActive = settingDto.IsActive;
                setting.FourSeaterTables = settingDto.FourSeaterTables;
                setting.SixSeaterTables = settingDto.SixSeaterTables;
                setting.LastUpdated = DateTime.UtcNow;
                _context.Entry(setting).State = EntityState.Modified;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // GET: api/Configuration/daily
        [HttpGet("daily")]
        public async Task<ActionResult<IEnumerable<DailyServiceSettingDto>>> GetDailyServiceSettings(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] bool? isActive = null)
        {
            var query = _context.DailyServiceSettings.AsQueryable();

            if (startDate.HasValue)
                query = query.Where(s => DateTime.Parse(s.Date) >= startDate.Value);
            
            if (endDate.HasValue)
                query = query.Where(s => DateTime.Parse(s.Date) <= endDate.Value);
            
            if (isActive.HasValue)
                query = query.Where(s => s.IsActive == isActive.Value);

            var settings = await query.ToListAsync();
            
            var settingDtos = settings.Select(s => new DailyServiceSettingDto
            {
                Date = s.Date,
                IsActive = s.IsActive,
                FourSeaterTables = s.FourSeaterTables,
                SixSeaterTables = s.SixSeaterTables,
                LastUpdated = s.LastUpdated
            }).ToList();

            return Ok(settingDtos);
        }
    }
}