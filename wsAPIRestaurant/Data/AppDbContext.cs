using Microsoft.EntityFrameworkCore;


    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Person> People { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<DefaultConfiguration> DefaultConfigurations { get; set; }
        public DbSet<DailyServiceSetting> DailyServiceSettings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración de People
            modelBuilder.Entity<Person>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Email).IsRequired(false);
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Configuración de Reservations
            modelBuilder.Entity<Reservation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TableId).IsRequired();
                entity.Property(e => e.Date).IsRequired();
                entity.Property(e => e.ReservedById).IsRequired();
                entity.Property(e => e.AttendeeIdsJSON).IsRequired();
            });

            // Configuración de DailyServiceSettings
            modelBuilder.Entity<DailyServiceSetting>(entity =>
            {
                entity.HasKey(e => e.Date);
                entity.Property(e => e.Date).IsRequired();
            });

            // Configuración de DefaultConfiguration
            modelBuilder.Entity<DefaultConfiguration>(entity =>
            {
                entity.HasKey(e => e.Id);
            });

            // Seed data por defecto
            modelBuilder.Entity<DefaultConfiguration>().HasData(
                new DefaultConfiguration 
                { 
                    Id = 1, 
                    FourSeaterTables = 5, 
                    SixSeaterTables = 3, 
                    LastUpdated = DateTime.UtcNow 
                }
            );
        }
    }
