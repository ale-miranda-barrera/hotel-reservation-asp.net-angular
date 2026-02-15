// src/Application/DTOs/ReservationDto.cs
namespace HotelReservationAPI.Application.DTOs
{
    public class ReservationDto
    {
        public int Id { get; set; }
        public int HotelId { get; set; }
        public string? HotelName { get; set; }
        public string? GuestName { get; set; }
        public string? GuestEmail { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public int RoomNumber { get; set; }
        public string? Status { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
