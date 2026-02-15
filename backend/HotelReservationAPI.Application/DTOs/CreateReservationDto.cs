// src/Application/DTOs/CreateReservationDto.cs
namespace HotelReservationAPI.Application.DTOs
{
    public class CreateReservationDto
    {
        public int HotelId { get; set; }
        public string? GuestName { get; set; }
        public string? GuestEmail { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public int RoomNumber { get; set; }
        // Precio por noche opcional: si el cliente lo envía, se usa para el cálculo.
        // Si no se envía, el servicio aplica un precio base por defecto.
        // TotalPrice se calcula en el servidor — nunca debe venir del cliente.
        public decimal? PricePerNight { get; set; }
    }
}
