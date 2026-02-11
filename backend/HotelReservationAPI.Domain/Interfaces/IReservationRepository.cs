using HotelReservationAPI.Domain.Entities;

namespace HotelReservationAPI.Domain.Interfaces
{
    public interface IReservationRepository
    {
        Task<Reservation> GetByIdAsync(int id);
        Task<IEnumerable<Reservation>> GetByGuestEmailAsync(string email);
        Task<IEnumerable<Reservation>> GetByHotelAsync(int hotelId);
        Task AddAsync(Reservation reservation);
        Task UpdateAsync(Reservation reservation);
        Task DeleteAsync(int id);
        Task SaveChangesAsync();
    }
}