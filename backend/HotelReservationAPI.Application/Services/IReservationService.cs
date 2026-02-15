// src/Application/Services/IReservationService.cs
using HotelReservationAPI.Application.DTOs;

namespace HotelReservationAPI.Application.Services
{
    public interface IReservationService
    {
        Task<ReservationDto> GetReservationByIdAsync(int id);
        Task<IEnumerable<ReservationDto>> GetReservationsByEmailAsync(string email);
        Task<IEnumerable<ReservationDto>> GetByHotelAsync(int id);
        Task<ReservationDto> CreateReservationAsync(CreateReservationDto dto);
        Task<bool> CancelReservationAsync(int id);
        Task<IEnumerable<ReservationDto>> GetPendingReservationsAsync();
        Task<ReservationDto> UpdateStatusAsync(int id, string status);
    }
}
