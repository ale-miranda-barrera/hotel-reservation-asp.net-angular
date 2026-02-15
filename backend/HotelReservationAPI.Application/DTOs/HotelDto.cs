namespace HotelReservationAPI.Application.DTOs
{
    public class HotelDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? City { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public decimal PricePerNight { get; set; }
    }
}