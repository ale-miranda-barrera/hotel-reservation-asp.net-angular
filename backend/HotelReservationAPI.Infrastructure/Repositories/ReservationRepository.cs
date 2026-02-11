using Microsoft.EntityFrameworkCore;
using HotelReservationAPI.Domain.Entities;
using HotelReservationAPI.Domain.Interfaces;
using HotelReservationAPI.Infrastructure.Data;

namespace HotelReservationAPI.Infrastructure.Repositories
{
    public class ReservationRepository : IReservationRepository
    {
        private readonly AppDbContext _context;

        public ReservationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Reservation> GetByIdAsync(int id)
        {
            return await _context.Reservations
                .Include(r => r.Hotel)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<Reservation>> GetByGuestEmailAsync(string email)
        {
            return await _context.Reservations
                .Where(r => r.GuestEmail == email)
                .Include(r => r.Hotel)
                .ToListAsync();
        }

        public async Task<IEnumerable<Reservation>> GetByHotelAsync(int hotelId)
        {
            return await _context.Reservations
                .Where(r => r.HotelId == hotelId)
                .ToListAsync();
        }

        public async Task AddAsync(Reservation reservation)
        {
            await _context.Reservations.AddAsync(reservation);
        }

        public async Task UpdateAsync(Reservation reservation)
        {
            _context.Reservations.Update(reservation);
        }

        public async Task DeleteAsync(int id)
        {
            var reservation = await GetByIdAsync(id);
            if (reservation != null)
                _context.Reservations.Remove(reservation);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}