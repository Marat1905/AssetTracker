using AssetTracker.Application.DTOs;
using AssetTracker.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AssetTracker.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class BearingsController : ControllerBase
{
    private readonly IBearingService _bearingService;

    public BearingsController(IBearingService bearingService)
    {
        _bearingService = bearingService;
    }

    /// <summary>
    /// Получить список всех подшипников
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<BearingDto>>> GetAll()
    {
        var bearings = await _bearingService.GetAllAsync();
        return Ok(bearings);
    }

    /// <summary>
    /// Получить подшипник по Id
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BearingDto>> GetById(int id)
    {
        var bearing = await _bearingService.GetByIdAsync(id);
        if (bearing == null)
            return NotFound();
        return Ok(bearing);
    }

    /// <summary>
    /// Создать новый подшипник
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<BearingDto>> Create([FromBody] CreateBearingDto dto)
    {
        try
        {
            var created = await _bearingService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Обновить подшипник
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<BearingDto>> Update(int id, [FromBody] UpdateBearingDto dto)
    {
        try
        {
            var updated = await _bearingService.UpdateAsync(id, dto);
            return Ok(updated);
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
    /// Удалить подшипник
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _bearingService.DeleteAsync(id);
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
}