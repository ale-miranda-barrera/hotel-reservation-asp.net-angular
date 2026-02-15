namespace HotelReservationAPI.Domain.Entities
{
    public class Hotel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string City { get; set; }
        public string Address { get; set; }
        public string Phone { get; set; }
        public decimal PricePerNight { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Relación 1:N
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();

        // Métodos puros
        public bool IsValidHotel()
        {
            return !string.IsNullOrEmpty(Name) &&
                   !string.IsNullOrEmpty(City) &&
                   !string.IsNullOrEmpty(Address);
        }
    }
}