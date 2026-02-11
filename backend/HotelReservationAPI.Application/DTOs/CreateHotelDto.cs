namespace HotelReservationAPI.Application.DTOs
{
    public class CreateHotelDto
    {
        public string? Name { get; set; }
        public string? City { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
    }
}