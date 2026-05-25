using AssetTracker.Application.DTOs;
using AssetTracker.Application.Interfaces;
using AssetTracker.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssetTracker.WebAPI.Controllers;

/// <summary>
/// Контроллер для управления электродвигателями.
/// </summary>
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
    /// Первичная регистрация нового двигателя.
    /// </summary>
    /// <param name="dto">Данные для создания двигателя.</param>
    /// <returns>Полная карточка созданного двигателя.</returns>
    //[Authorize(Policy = "Electro")]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<MotorFullHistoryDto>> CreateMotor([FromBody] CreateMotorDto dto)
    {
        try
        {
            var result = await _motorService.CreateMotorAsync(dto);
            return CreatedAtAction(nameof(GetFullHistory), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Установить или изменить инвентарный номер двигателя.
    /// </summary>
    /// <param name="motorId">Суррогатный идентификатор двигателя.</param>
    /// <param name="dto">Новый инвентарный номер.</param>
    //[Authorize(Policy = "Electro")]
    [HttpPatch("{motorId}/inventory-number")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SetInventoryNumber(int motorId, [FromBody] SetInventoryNumberDto dto)
    {
        try
        {
            await _motorService.SetInventoryNumberAsync(motorId, dto);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Перемещение двигателя (автоматически закрывает старую запись в истории перемещений).
    /// </summary>
    /// <param name="motorId">Суррогатный идентификатор двигателя.</param>
    /// <param name="dto">Новое местоположение и опционально новый статус.</param>
    //[Authorize(Policy = "Electro")]
    [HttpPatch("{motorId}/move")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> MoveMotor(int motorId, [FromBody] MoveMotorDto dto)
    {
        await _motorService.MoveMotorAsync(motorId, dto);
        return NoContent();
    }

    /// <summary>
    /// Фиксация факта ремонта или смазки.
    /// </summary>
    /// <param name="motorId">Суррогатный идентификатор двигателя.</param>
    /// <param name="dto">Данные о выполненной работе.</param>
    //[Authorize(Policy = "Electro")]
    [HttpPost("{motorId}/maintenance")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddMaintenance(int motorId, [FromBody] MaintenanceDto dto)
    {
        await _motorService.AddMaintenanceAsync(motorId, dto);
        return NoContent();
    }

    /// <summary>
    /// Получение "карточки жизни" ЭД: где стоял и что с ним делали (без пагинации – для мобильных устройств).
    /// </summary>
    /// <param name="motorId">Суррогатный идентификатор двигателя.</param>
    /// <returns>Полная история двигателя.</returns>
    [HttpGet("{motorId}/full-history")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MotorFullHistoryDto>> GetFullHistory(int motorId)
    {
        var history = await _motorService.GetFullHistoryAsync(motorId);
        return Ok(history);
    }

    /// <summary>
    /// Получение списка всех электродвигателей (без пагинации – для мобильных устройств).
    /// </summary>
    /// <returns>Краткий список двигателей.</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<MotorListItemDto>>> GetAllMotors()
    {
        var motors = await _motorService.GetAllMotorsAsync();
        return Ok(motors);
    }

    /// <summary>
    /// Получение списка электродвигателей с пагинацией и фильтрацией (для UI).
    /// </summary>
    /// <param name="page">Номер страницы (начиная с 1).</param>
    /// <param name="pageSize">Размер страницы.</param>
    /// <param name="inventoryNumber">Фильтр по инвентарному номеру (частичное совпадение).</param>
    /// <param name="location">Фильтр по текущему местоположению (частичное совпадение).</param>
    /// <param name="status">Фильтр по статусу.</param>
    /// <returns>Страница с результатами.</returns>
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
    /// Получение пагинированной истории перемещений двигателя (для UI).
    /// </summary>
    /// <param name="motorId">Суррогатный идентификатор двигателя.</param>
    /// <param name="page">Номер страницы.</param>
    /// <param name="pageSize">Размер страницы.</param>
    /// <returns>Страница истории перемещений.</returns>
    [HttpGet("{motorId}/location-history/paged")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PagedResult<LocationHistoryDto>>> GetLocationHistoryPaged(
        int motorId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        var result = await _motorService.GetMotorLocationHistoryPagedAsync(motorId, page, pageSize);
        return Ok(result);
    }

    /// <summary>
    /// Получение пагинированного журнала обслуживания двигателя с возможностью фильтрации по типу работ и периоду времени (для UI).
    /// </summary>
    /// <param name="motorId">Суррогатный идентификатор двигателя.</param>
    /// <param name="page">Номер страницы.</param>
    /// <param name="pageSize">Размер страницы.</param>
    /// <param name="workType">Фильтр по типу работ.</param>
    /// <param name="fromDate">Фильтр по дате – записи не ранее указанной даты.</param>
    /// <param name="toDate">Фильтр по дате – записи не позднее указанной даты.</param>
    /// <returns>Страница записей обслуживания.</returns>
    [HttpGet("{motorId}/maintenance-logs/paged")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PagedResult<MaintenanceLogDto>>> GetMaintenanceLogsPaged(
        int motorId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] MaintenanceType? workType = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;

        try
        {
            var result = await _motorService.GetMotorMaintenanceLogsPagedAsync(motorId, page, pageSize, workType, fromDate, toDate);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    /// <summary>
    /// Редактирование основных характеристик двигателя.
    /// </summary>
    /// <param name="motorId">Суррогатный идентификатор двигателя.</param>
    /// <param name="dto">Обновлённые характеристики.</param>
    //[Authorize(Policy = "Electro")]
    [HttpPut("{motorId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateMotor(int motorId, [FromBody] UpdateMotorDto dto)
    {
        await _motorService.UpdateMotorAsync(motorId, dto);
        return NoContent();
    }

    /// <summary>
    /// Удаление двигателя (вместе со всей историей перемещений и обслуживания).
    /// </summary>
    /// <param name="motorId">Суррогатный идентификатор двигателя.</param>
    //[Authorize(Policy = "Electro")]
    [HttpDelete("{motorId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMotor(int motorId)
    {
        await _motorService.DeleteMotorAsync(motorId);
        return NoContent();
    }

    /// <summary>
    /// Редактирование записи обслуживания (комментарий и, для смазки, тип смазки).
    /// </summary>
    /// <param name="motorId">Суррогатный идентификатор двигателя.</param>
    /// <param name="logId">Идентификатор записи обслуживания.</param>
    /// <param name="dto">Новые данные.</param>
    //[Authorize(Policy = "Electro")]
    [HttpPut("{motorId}/maintenance/{logId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateMaintenanceLog(int motorId, int logId, [FromBody] UpdateMaintenanceLogDto dto)
    {
        try
        {
            await _motorService.UpdateMaintenanceLogAsync(motorId, logId, dto);
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
    /// Удаление записи обслуживания.
    /// </summary>
    /// <param name="motorId">Суррогатный идентификатор двигателя.</param>
    /// <param name="logId">Идентификатор записи обслуживания.</param>
    //[Authorize(Policy = "Electro")]
    [HttpDelete("{motorId}/maintenance/{logId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMaintenanceLog(int motorId, int logId)
    {
        try
        {
            await _motorService.DeleteMaintenanceLogAsync(motorId, logId);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    /// <summary>
    /// Редактирование записи истории перемещений (только изменение места, даты не редактируются).
    /// </summary>
    /// <param name="motorId">Суррогатный идентификатор двигателя.</param>
    /// <param name="locationHistoryId">Идентификатор записи истории перемещений.</param>
    /// <param name="dto">Новое расположение.</param>
    //[Authorize(Policy = "Electro")]
    [HttpPut("{motorId}/location-history/{locationHistoryId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateLocationHistory(int motorId, int locationHistoryId, [FromBody] UpdateLocationHistoryDto dto)
    {
        try
        {
            await _motorService.UpdateLocationHistoryAsync(motorId, locationHistoryId, dto);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Удаление записи истории перемещений (с проверкой целостности временной линии).
    /// </summary>
    /// <param name="motorId">Суррогатный идентификатор двигателя.</param>
    /// <param name="locationHistoryId">Идентификатор записи истории перемещений.</param>
    //[Authorize(Policy = "Electro")]
    [HttpDelete("{motorId}/location-history/{locationHistoryId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> DeleteLocationHistory(int motorId, int locationHistoryId)
    {
        try
        {
            await _motorService.DeleteLocationHistoryAsync(motorId, locationHistoryId);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}