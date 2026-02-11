namespace HotelReservationAPI.Domain.Entities
{
    public class Reservation
    {
        public int Id { get; set; }
        public int HotelId { get; set; }
        public string GuestName { get; set; }
        public string GuestEmail { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public int RoomNumber { get; set; }
        public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
        public decimal TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Relación N:1
        public Hotel Hotel { get; set; }

        // Métodos puros
        public bool IsValidReservation()
        {
            return CheckOutDate > CheckInDate &&
                   !string.IsNullOrEmpty(GuestName) &&
                   !string.IsNullOrEmpty(GuestEmail);
        }

        public decimal CalculatePrice(decimal nightlyRate)
        {
            int nights = (CheckOutDate - CheckInDate).Days;
            return nights * nightlyRate;
        }
    }
}