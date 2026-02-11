using Microsoft.EntityFrameworkCore;
using HotelReservationAPI.Domain.Entities;
using HotelReservationAPI.Domain.Interfaces;
using HotelReservationAPI.Infrastructure.Data;

namespace HotelReservationAPI.Infrastructure.Repositories
{
    public class HotelRepository : IHotelRepository
    {
        private readonly AppDbContext _context;

        public HotelRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Hotel>> GetAllAsync()
        {
            return await _context.Hotels.ToListAsync();
        }

        public async Task<Hotel> GetByIdAsync(int id)
        {
            return await _context.Hotels.FirstOrDefaultAsync(h => h.Id == id);
        }

        public async Task AddAsync(Hotel hotel)
        {
            await _context.Hotels.AddAsync(hotel);
        }

        public async Task UpdateAsync(Hotel hotel)
        {
            _context.Hotels.Update(hotel);
        }

        public async Task DeleteAsync(int id)
        {
            var hotel = await GetByIdAsync(id);
            if (hotel != null)
                _context.Hotels.Remove(hotel);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}