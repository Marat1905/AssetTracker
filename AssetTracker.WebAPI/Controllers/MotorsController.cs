using Microsoft.AspNetCore.Mvc;
using AssetTracker.Application.DTOs;
using AssetTracker.Application.Interfaces;

namespace AssetTracker.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class MotorsController : ControllerBase
{
    private readonly IMotorService _motorService;

    public MotorsController(IMotorService motorService)
    {
        _motorService = motorService;
    }

    /// <summary>
    /// Первичная регистрация нового двигателя
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<MotorFullHistoryDto>> CreateMotor([FromBody] CreateMotorDto dto)
    {
        try
        {
            var result = await _motorService.CreateMotorAsync(dto);
            return CreatedAtAction(nameof(GetFullHistory), new { id = result.InventoryNumber }, result);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Перемещение двигателя (автоматически закрывает старую запись в истории перемещений)
    /// </summary>
    [HttpPatch("{id}/move")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> MoveMotor(int id, [FromBody] MoveMotorDto dto)
    {
        await _motorService.MoveMotorAsync(id, dto);
        return NoContent();
    }

    /// <summary>
    /// Фиксация факта ремонта или смазки
    /// </summary>
    [HttpPost("{id}/maintenance")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddMaintenance(int id, [FromBody] MaintenanceDto dto)
    {
        await _motorService.AddMaintenanceAsync(id, dto);
        return NoContent();
    }

    /// <summary>
    /// Получение "карточки жизни" ЭД: где стоял и что с ним делали
    /// </summary>
    [HttpGet("{id}/full-history")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MotorFullHistoryDto>> GetFullHistory(int id)
    {
        var history = await _motorService.GetFullHistoryAsync(id);
        return Ok(history);
    }

    /// <summary>
    /// Получение списка всех электродвигателей (для UI)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<MotorListItemDto>>> GetAllMotors()
    {
        var motors = await _motorService.GetAllMotorsAsync();
        return Ok(motors);
    }

    /// <summary>
    /// Редактирование основных характеристик двигателя
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateMotor(int id, [FromBody] UpdateMotorDto dto)
    {
        await _motorService.UpdateMotorAsync(id, dto);
        return NoContent();
    }

    /// <summary>
    /// Удаление двигателя (вместе со всей историей перемещений и обслуживания)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMotor(int id)
    {
        await _motorService.DeleteMotorAsync(id);
        return NoContent();
    }
}