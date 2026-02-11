using HotelReservationAPI.Application.DTOs;
using HotelReservationAPI.Domain.Entities;
using HotelReservationAPI.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace HotelReservationAPI.Application.Services
{
    public class HotelService : IHotelService //DIP
    {

        /*
        Que patrones solid y problemas evitamos: Notas:
        Inyección de Dependencia (DI): Técnica = pasar dependencias por constructor
        Inversión de control (IoC): Principio = no creas tus dependencias, déjale al contenedor
        Principio de Inversión de Dependencia (SÓLIDO): Regla = depende de abstracciones (interfaces), no de concretos
        //✅ DI: pasas por constructor
        //✅ Inversión de Control (IoC): no haces new HotelRepository(), se lo deja al contenedor
        //✅ Inversión de dependencia: usas IHotelRepository(interfaz), no la clase concreta
        */
        private readonly IHotelRepository _repository;
        private readonly ILogger<HotelService> _logger;

        public HotelService(IHotelRepository repository, ILogger<HotelService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<HotelDto>> GetAllHotelsAsync()
        {
            _logger.LogInformation("Obteniendo todos los hoteles");
            var hotels = await _repository.GetAllAsync();
            return hotels.Select(h => new HotelDto
            {
                Id = h.Id,
                Name = h.Name,
                City = h.City,
                Address = h.Address,
                Phone = h.Phone
            });
        }

        public async Task<HotelDto> GetHotelByIdAsync(int id)
        {
            _logger.LogInformation($"Obteniendo hotel {id}");
            var hotel = await _repository.GetByIdAsync(id);

            if (hotel == null)
            {
                _logger.LogWarning($"Hotel {id} no encontrado");
                throw new KeyNotFoundException($"Hotel con ID {id} no encontrado");
            }

            return new HotelDto
            {
                Id = hotel.Id,
                Name = hotel.Name,
                City = hotel.City,
                Address = hotel.Address,
                Phone = hotel.Phone
            };
        }

        public async Task<HotelDto> CreateHotelAsync(CreateHotelDto dto)
        {
            _logger.LogInformation($"Creando hotel: {dto.Name}");

            var hotel = new Hotel
            {
                Name = dto.Name,
                City = dto.City,
                Address = dto.Address,
                Phone = dto.Phone
            };

            if (!hotel.IsValidHotel())
            {
                _logger.LogWarning("Hotel inválido");
                throw new InvalidOperationException("Hotel inválido");
            }

            await _repository.AddAsync(hotel);
            await _repository.SaveChangesAsync();

            _logger.LogInformation($"Hotel {hotel.Id} creado");

            return new HotelDto
            {
                Id = hotel.Id,
                Name = hotel.Name,
                City = hotel.City,
                Address = hotel.Address,
                Phone = hotel.Phone
            };
        }

        public async Task<HotelDto> UpdateHotelAsync(int id, CreateHotelDto dto)
        {
            _logger.LogInformation($"Actualizando hotel {id}");

            var hotel = await _repository.GetByIdAsync(id);
            if (hotel == null)
            {
                _logger.LogWarning($"Hotel {id} no encontrado");
                throw new KeyNotFoundException($"Hotel {id} no encontrado");
            }

            hotel.Name = dto.Name;
            hotel.City = dto.City;
            hotel.Address = dto.Address;
            hotel.Phone = dto.Phone;
            hotel.UpdatedAt = DateTime.UtcNow;

            if (!hotel.IsValidHotel())
                throw new InvalidOperationException("Hotel inválido");

            await _repository.UpdateAsync(hotel);
            await _repository.SaveChangesAsync();

            return new HotelDto
            {
                Id = hotel.Id,
                Name = hotel.Name,
                City = hotel.City,
                Address = hotel.Address,
                Phone = hotel.Phone
            };
        }

        public async Task<bool> DeleteHotelAsync(int id)
        {
            _logger.LogInformation($"Eliminando hotel {id}");

            var hotel = await _repository.GetByIdAsync(id);
            if (hotel == null)
            {
                _logger.LogWarning($"Hotel {id} no encontrado");
                return false;
            }

            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();

            return true;
        }
    }
}