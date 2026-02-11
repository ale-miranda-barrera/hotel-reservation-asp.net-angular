using HotelReservationAPI.Application.DTOs;

namespace HotelReservationAPI.Application.Services
{
    public interface IHotelService
    {
        Task<IEnumerable<HotelDto>> GetAllHotelsAsync();
        Task<HotelDto> GetHotelByIdAsync(int id);
        Task<HotelDto> CreateHotelAsync(CreateHotelDto dto);
        Task<HotelDto> UpdateHotelAsync(int id, CreateHotelDto dto);
        Task<bool> DeleteHotelAsync(int id);
    }
}