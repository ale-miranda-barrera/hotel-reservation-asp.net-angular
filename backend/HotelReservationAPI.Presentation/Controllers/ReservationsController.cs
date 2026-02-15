// src/Presentation/Controllers/ReservationsController.cs
using Microsoft.AspNetCore.Mvc;
using HotelReservationAPI.Application.DTOs;
using HotelReservationAPI.Application.Services;

namespace HotelReservationAPI.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationsController : ControllerBase // DIP
    {
        private readonly IReservationService _service;
        private readonly ILogger<ReservationsController> _logger;

        // El controlador depende de la interfaz IReservationService, nunca de ReservationService directamente.
        // Si mañana se cambia la implementación del servicio, este controlador no se modifica.
        public ReservationsController(IReservationService service, ILogger<ReservationsController> logger)
        {
            _service = service;
            _logger = logger;
        }

        // GET /api/reservations?email=guest@hotel.com
        // Si se pasa email → filtra por ese email. Sin email → 400 BadRequest.
        // El README define este endpoint como "Mis reservas" con filtro por email.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReservationDto>>> GetReservationsByEmail([FromQuery] string email)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(email))
                    return BadRequest(new { error = "El parámetro 'email' es requerido" });

                var reservations = await _service.GetReservationsByEmailAsync(email);
                return Ok(reservations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo reservaciones por email");
                return StatusCode(500, new { error = "Error interno" });
            }
        }

        // GET /api/reservations/hotel/{hotelId}
        // Retorna todas las reservaciones de un hotel específico
        // La ruta literal "hotel" debe declararse ANTES de "{id}" para que ASP.NET
        // no interprete "hotel" como un valor del parámetro entero {id}
        [HttpGet("hotel/{hotelId}")]
        public async Task<ActionResult<IEnumerable<ReservationDto>>> GetReservationsByHotel(int hotelId)
        {
            try
            {
                var reservations = await _service.GetByHotelAsync(hotelId);
                return Ok(reservations);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo reservaciones por hotel");
                return StatusCode(500, new { error = "Error interno" });
            }
        }

        // GET /api/reservations/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ReservationDto>> GetReservationById(int id)
        {
            try
            {
                var reservation = await _service.GetReservationByIdAsync(id);
                return Ok(reservation);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo reservación");
                return StatusCode(500, new { error = "Error interno" });
            }
        }

        // POST /api/reservations
        // Retorna 201 Created con la reservación creada y el header Location apuntando al GET por id
        [HttpPost]
        public async Task<ActionResult<ReservationDto>> CreateReservation([FromBody] CreateReservationDto dto)
        {
            try
            {
                if (dto.HotelId <= 0)
                    return BadRequest(new { error = "HotelId es requerido" });

                if (string.IsNullOrWhiteSpace(dto.GuestName))
                    return BadRequest(new { error = "GuestName es requerido" });

                if (string.IsNullOrWhiteSpace(dto.GuestEmail))
                    return BadRequest(new { error = "GuestEmail es requerido" });

                var reservation = await _service.CreateReservationAsync(dto);
                return CreatedAtAction(nameof(GetReservationById), new { id = reservation.Id }, reservation);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creando reservación");
                return StatusCode(500, new { error = "Error interno" });
            }
        }

        // GET /api/reservations/pending
        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<ReservationDto>>> GetPendingReservations()
        {
            try
            {
                var reservations = await _service.GetPendingReservationsAsync();
                return Ok(reservations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo reservaciones pendientes");
                return StatusCode(500, new { error = "Error interno" });
            }
        }

        // PATCH /api/reservations/{id}/status
        [HttpPatch("{id}/status")]
        public async Task<ActionResult<ReservationDto>> UpdateReservationStatus(int id, [FromBody] UpdateReservationStatusDto dto)
        {
            try
            {
                var reservation = await _service.UpdateStatusAsync(id, dto.Status);
                return Ok(reservation);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error actualizando estado de reservación");
                return StatusCode(500, new { error = "Error interno" });
            }
        }

        // DELETE /api/reservations/{id}
        // No elimina físicamente — cambia el Status a Cancelled (soft delete semántico)
        // Retorna 204 No Content cuando se cancela correctamente
        [HttpDelete("{id}")]
        public async Task<ActionResult> CancelReservation(int id)
        {
            try
            {
                var success = await _service.CancelReservationAsync(id);
                if (!success)
                    return NotFound(new { error = "Reservación no encontrada" });

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelando reservación");
                return StatusCode(500, new { error = "Error interno" });
            }
        }
    }
}
