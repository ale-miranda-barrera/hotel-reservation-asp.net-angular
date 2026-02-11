using Microsoft.AspNetCore.Mvc;
using HotelReservationAPI.Application.DTOs;
using HotelReservationAPI.Application.Services;

namespace HotelReservationAPI.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HotelsController : ControllerBase //DIP
    {
        private readonly IHotelService _service;
        private readonly ILogger<HotelsController> _logger;

        //de esta manera se evita acoplar la clase a una implementación concreta, en palabras mas simples,
        //si manana se cambia el servicio, no nos importa porque el controlador depende de la abstraccion de la interfaz,
        //y el servicio cuando se crea tambien debe cumplir la interfaz - de este modo sabemos que el contrato lo cumplen las diferentes partes.
        public HotelsController(IHotelService service, ILogger<HotelsController> logger) 
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<HotelDto>>> GetAllHotels()
        {
            try
            {
                var hotels = await _service.GetAllHotelsAsync();
                return Ok(hotels);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo hoteles");
                return StatusCode(500, new { error = "Error interno" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<HotelDto>> GetHotelById(int id)
        {
            try
            {
                var hotel = await _service.GetHotelByIdAsync(id);
                return Ok(hotel);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo hotel");
                return StatusCode(500, new { error = "Error interno" });
            }
        }

        [HttpPost]
        public async Task<ActionResult<HotelDto>> CreateHotel([FromBody] CreateHotelDto dto)
        {
            try
            {
                if (string.IsNullOrEmpty(dto.Name))
                    return BadRequest(new { error = "Name es requerido" });

                var hotel = await _service.CreateHotelAsync(dto);
                return CreatedAtAction(nameof(GetHotelById), new { id = hotel.Id }, hotel);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creando hotel");
                return StatusCode(500, new { error = "Error interno" });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<HotelDto>> UpdateHotel(int id, [FromBody] CreateHotelDto dto)
        {
            try
            {
                var hotel = await _service.UpdateHotelAsync(id, dto);
                return Ok(hotel);
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
                _logger.LogError(ex, "Error actualizando hotel");
                return StatusCode(500, new { error = "Error interno" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteHotel(int id)
        {
            try
            {
                var success = await _service.DeleteHotelAsync(id);
                if (!success)
                    return NotFound(new { error = "Hotel no encontrado" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error eliminando hotel");
                return StatusCode(500, new { error = "Error interno" });
            }
        }
    }
}