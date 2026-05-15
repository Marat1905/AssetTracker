using Microsoft.AspNetCore.Mvc;
using AssetTracker.Application.DTOs;
using AssetTracker.Application.Interfaces;
using AssetTracker.Domain.Enums;

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
    /// Получение "карточки жизни" ЭД: где стоял и что с ним делали (без пагинации – для мобильных устройств)
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
    /// Получение списка всех электродвигателей (без пагинации – для мобильных устройств)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<MotorListItemDto>>> GetAllMotors()
    {
        var motors = await _motorService.GetAllMotorsAsync();
        return Ok(motors);
    }

    /// <summary>
    /// Получение списка электродвигателей с пагинацией и фильтрацией (для UI)
    /// </summary>
    [HttpGet("paged")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<MotorListItemDto>>> GetMotorsPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? inventoryNumber = null,
        [FromQuery] string? location = null,
        [FromQuery] MotorStatus? status = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        var result = await _motorService.GetMotorsPagedAsync(page, pageSize, inventoryNumber, location, status);
        return Ok(result);
    }

    /// <summary>
    /// Получение пагинированной истории перемещений двигателя (для UI)
    /// </summary>
    [HttpGet("{id}/location-history/paged")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PagedResult<LocationHistoryDto>>> GetLocationHistoryPaged(
        int id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        var result = await _motorService.GetMotorLocationHistoryPagedAsync(id, page, pageSize);
        return Ok(result);
    }

    /// <summary>
    /// Получение пагинированного журнала обслуживания двигателя (для UI)
    /// </summary>
    [HttpGet("{id}/maintenance-logs/paged")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PagedResult<MaintenanceLogDto>>> GetMaintenanceLogsPaged(
        int id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        var result = await _motorService.GetMotorMaintenanceLogsPagedAsync(id, page, pageSize);
        return Ok(result);
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

    /// <summary>
    /// Редактирование записи обслуживания (комментарий и, для смазки, тип смазки)
    /// </summary>
    [HttpPut("{id}/maintenance/{logId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateMaintenanceLog(int id, int logId, [FromBody] UpdateMaintenanceLogDto dto)
    {
        try
        {
            await _motorService.UpdateMaintenanceLogAsync(id, logId, dto);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Удаление записи обслуживания
    /// </summary>
    [HttpDelete("{id}/maintenance/{logId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMaintenanceLog(int id, int logId)
    {
        try
        {
            await _motorService.DeleteMaintenanceLogAsync(id, logId);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}