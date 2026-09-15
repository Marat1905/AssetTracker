using AssetTracker.Application.DTOs;
using AssetTracker.Application.Interfaces;
using AssetTracker.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace AssetTracker.WebAPI.Controllers;

/// <summary>
/// Контроллер для формирования отчётов.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ReportsController : ControllerBase
{
    private readonly IMotorService _motorService;

    public ReportsController(IMotorService motorService)
    {
        _motorService = motorService;
    }

    /// <summary>
    /// Получить детальный отчёт по обслуживанию за период (с пагинацией).
    /// </summary>
    /// <param name="fromDate">Начало периода (в формате yyyy-MM-dd).</param>
    /// <param name="toDate">Окончание периода (в формате yyyy-MM-dd).</param>
    /// <param name="workType">Тип работ (опционально).</param>
    /// <param name="page">Номер страницы (начиная с 1).</param>
    /// <param name="pageSize">Размер страницы (1-100).</param>
    /// <returns>Страница записей обслуживания.</returns>
    [HttpGet("maintenance")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PagedResult<MaintenanceReportItemDto>>> GetMaintenanceReport(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] MaintenanceType? workType,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 20;
            if (pageSize > 100) pageSize = 100;

            var result = await _motorService.GetMaintenanceReportPagedAsync(
                fromDate, toDate, workType, page, pageSize);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Получить сводку по обслуживанию за период (количество записей по каждому типу работ).
    /// </summary>
    /// <param name="fromDate">Начало периода (в формате yyyy-MM-dd).</param>
    /// <param name="toDate">Окончание периода (в формате yyyy-MM-dd).</param>
    /// <returns>Список с количеством записей по каждому типу работ.</returns>
    [HttpGet("maintenance/summary")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IEnumerable<MaintenanceReportSummaryDto>>> GetMaintenanceReportSummary(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate)
    {
        try
        {
            var summary = await _motorService.GetMaintenanceReportSummaryAsync(fromDate, toDate);
            return Ok(summary);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}