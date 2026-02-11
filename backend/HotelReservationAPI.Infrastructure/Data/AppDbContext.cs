
using HotelReservationAPI.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelReservationAPI.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<Hotel> Hotels { get; set; }
        public DbSet<Reservation> Reservations { get; set; }

        public AppDbContext (DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Config relation 1:N
            modelBuilder.Entity<Hotel>()
                .HasMany(h => h.Reservations)
                .WithOne(r => r.Hotel)
                .HasForeignKey(r => r.HotelId)
                .OnDelete(DeleteBehavior.Cascade);

            // Properties Hotel
            modelBuilder.Entity<Hotel>()
                .Property(h => h.Name)
                .HasMaxLength(200)
                .IsRequired();

            modelBuilder.Entity<Hotel>()
                .Property(h => h.City)
                .HasMaxLength(100)
                .IsRequired();

            // Properties Reservation
            modelBuilder.Entity<Reservation>()
                .Property(r => r.GuestName)
                .HasMaxLength(100)
                .IsRequired();

            modelBuilder.Entity<Reservation>()
                .Property(r => r.GuestEmail)
                .HasMaxLength(100)
                .IsRequired();

            // inicial data - 4 hotels
            modelBuilder.Entity<Hotel>().HasData(
                new Hotel
                {
                    Id = 1,
                    Name = "Hotel Bogotá",
                    City = "Bogotá",
                    Address = "Carrera 7 #24-89",
                    Phone = "601-2345678",
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new Hotel
                {
                    Id = 2,
                    Name = "Hotel Medellín",
                    City = "Medellín",
                    Address = "Avenida Paseo Peatonal",
                    Phone = "604-5678901",
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new Hotel
                {
                    Id = 3,
                    Name = "Hotel Cartagena",
                    City = "Cartagena",
                    Address = "Centro Histórico",
                    Phone = "605-9012345",
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new Hotel
                {
                    Id = 4,
                    Name = "Hotel Santa Marta",
                    City = "Santa Marta",
                    Address = "Frente al mar",
                    Phone = "605-3456789",
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                }
            );
        }
    }
}