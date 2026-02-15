// src/Application/Services/ReservationService.cs
using HotelReservationAPI.Application.DTOs;
using HotelReservationAPI.Domain.Entities;
using HotelReservationAPI.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace HotelReservationAPI.Application.Services
{
    public class ReservationService : IReservationService // DIP
    {
        /*
        Inyección de Dependencia (DI): el contenedor pasa IReservationRepository e IHotelRepository.
        Inversión de Dependencia (SOLID): depende de abstracciones (interfaces), nunca de clases concretas.
        Single Responsibility: este servicio solo orquesta flujos de Reservation.
        Necesitamos IHotelRepository porque validar que el hotel existe es lógica de negocio,
        no de persistencia — el Service es el lugar correcto para esa validación.
        */

        // Precio por noche por defecto cuando el cliente no envía PricePerNight.
        // Centralizado aquí para que el equipo sepa dónde ajustarlo.
        private const decimal DefaultNightlyRate = 150000m;

        private readonly IReservationRepository _reservationRepository;
        private readonly IHotelRepository _hotelRepository;
        private readonly ILogger<ReservationService> _logger;

        public ReservationService(
            IReservationRepository reservationRepository,
            IHotelRepository hotelRepository,
            ILogger<ReservationService> logger)
        {
            _reservationRepository = reservationRepository;
            _hotelRepository = hotelRepository;
            _logger = logger;
        }

        public async Task<ReservationDto> GetReservationByIdAsync(int id)
        {
            _logger.LogInformation($"Obteniendo reservación {id}");

            var reservation = await _reservationRepository.GetByIdAsync(id);

            if (reservation == null)
            {
                _logger.LogWarning($"Reservación {id} no encontrada");
                throw new KeyNotFoundException($"Reservación con ID {id} no encontrada");
            }

            return MapToDto(reservation);
        }

        public async Task<IEnumerable<ReservationDto>> GetReservationsByEmailAsync(string email)
        {
            _logger.LogInformation($"Obteniendo reservaciones del email: {email}");

            var reservations = await _reservationRepository.GetByGuestEmailAsync(email);

            return reservations.Select(MapToDto);
        }

        public async Task<IEnumerable<ReservationDto>> GetByHotelAsync(int id)
        {
            _logger.LogInformation($"Obteniendo reservaciones del hotel {id}");

            // Validación de negocio: verificar que el hotel existe antes de buscar sus reservaciones
            var hotel = await _hotelRepository.GetByIdAsync(id);
            if (hotel == null)
            {
                _logger.LogWarning($"Hotel {id} no encontrado al obtener reservaciones");
                throw new KeyNotFoundException($"Hotel con ID {id} no encontrado");
            }

            var reservations = await _reservationRepository.GetByHotelAsync(id);

            return reservations.Select(MapToDto);
        }

        public async Task<ReservationDto> CreateReservationAsync(CreateReservationDto dto)
        {
            _logger.LogInformation($"Creando reservación para hotel {dto.HotelId}");

            // Paso 1: Verificar que el hotel existe (validación de negocio)
            var hotel = await _hotelRepository.GetByIdAsync(dto.HotelId);
            if (hotel == null)
            {
                _logger.LogWarning($"Hotel {dto.HotelId} no encontrado al crear reservación");
                throw new KeyNotFoundException($"Hotel con ID {dto.HotelId} no encontrado");
            }

            // Paso 2: Crear la entidad de dominio
            var reservation = new Reservation
            {
                HotelId = dto.HotelId,
                GuestName = dto.GuestName,
                GuestEmail = dto.GuestEmail,
                CheckInDate = dto.CheckInDate,
                CheckOutDate = dto.CheckOutDate,
                RoomNumber = dto.RoomNumber,
                Status = ReservationStatus.Pending
            };

            // Paso 3: Validar con el método puro de la entidad (Domain logic)
            if (!reservation.IsValidReservation())
            {
                _logger.LogWarning("Datos de reservación inválidos");
                throw new InvalidOperationException(
                    "Datos inválidos: verifique que GuestName, GuestEmail y las fechas sean correctos (CheckOut debe ser posterior a CheckIn)");
            }

            // Paso 4: Calcular TotalPrice usando el método puro de la entidad de dominio.
            // Si el cliente envió PricePerNight, se usa ese valor (útil para precios de temporada).
            // Si no, se aplica el precio base por defecto definido en este servicio.
            decimal nightlyRate = dto.PricePerNight ?? DefaultNightlyRate;
            reservation.TotalPrice = reservation.CalculatePrice(nightlyRate);

            int nights = (reservation.CheckOutDate - reservation.CheckInDate).Days;
            _logger.LogInformation(
                $"TotalPrice calculado: {reservation.TotalPrice} ({nights} noches x {nightlyRate}/noche)");

            // Paso 5: Persistir
            await _reservationRepository.AddAsync(reservation);
            await _reservationRepository.SaveChangesAsync();

            _logger.LogInformation($"Reservación {reservation.Id} creada para hotel {reservation.HotelId}");

            // Paso 6: Retornar DTO con el nombre del hotel ya cargado
            reservation.Hotel = hotel;
            return MapToDto(reservation);
        }

        public async Task<bool> CancelReservationAsync(int id)
        {
            _logger.LogInformation($"Cancelando reservación {id}");

            var reservation = await _reservationRepository.GetByIdAsync(id);
            if (reservation == null)
            {
                _logger.LogWarning($"Reservación {id} no encontrada al cancelar");
                return false;
            }

            // Validación de negocio: no se puede cancelar una reserva ya cancelada
            if (reservation.Status == ReservationStatus.Cancelled)
            {
                _logger.LogWarning($"Reservación {id} ya está cancelada");
                throw new InvalidOperationException("La reservación ya está cancelada");
            }

            reservation.Status = ReservationStatus.Cancelled;
            reservation.UpdatedAt = DateTime.UtcNow;

            await _reservationRepository.UpdateAsync(reservation);
            await _reservationRepository.SaveChangesAsync();

            _logger.LogInformation($"Reservación {id} cancelada exitosamente");
            return true;
        }

        public async Task<IEnumerable<ReservationDto>> GetPendingReservationsAsync()
        {
            var reservations = await _reservationRepository.GetByStatusAsync(ReservationStatus.Pending);
            return reservations.Select(MapToDto);
        }

        public async Task<ReservationDto> UpdateStatusAsync(int id, string status)
        {
            var reservation = await _reservationRepository.GetByIdAsync(id);
            if (reservation == null)
                throw new KeyNotFoundException($"Reservación con ID {id} no encontrada");

            if (!Enum.TryParse<ReservationStatus>(status, true, out var newStatus))
                throw new InvalidOperationException($"Estado '{status}' no es válido. Use: Pending, Confirmed, Cancelled");

            reservation.Status = newStatus;
            reservation.UpdatedAt = DateTime.UtcNow;

            await _reservationRepository.UpdateAsync(reservation);
            await _reservationRepository.SaveChangesAsync();

            return MapToDto(reservation);
        }

        // Método privado para evitar repetir el mapeo Reservation -> ReservationDto
        // Equivalente a un mapper helper en Node — mantiene el código DRY
        private static ReservationDto MapToDto(Reservation reservation)
        {
            return new ReservationDto
            {
                Id = reservation.Id,
                HotelId = reservation.HotelId,
                HotelName = reservation.Hotel?.Name,
                GuestName = reservation.GuestName,
                GuestEmail = reservation.GuestEmail,
                CheckInDate = reservation.CheckInDate,
                CheckOutDate = reservation.CheckOutDate,
                RoomNumber = reservation.RoomNumber,
                Status = reservation.Status.ToString(),
                TotalPrice = reservation.TotalPrice,
                CreatedAt = reservation.CreatedAt
            };
        }
    }
}
