using AssetTracker.Application.DTOs;
using AssetTracker.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AssetTracker.WebAPI.Controllers;

/// <summary>
/// Контроллер для управления типами смазки.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class LubricantTypesController : ControllerBase
{
    private readonly ILubricantTypeService _lubricantTypeService;

    public LubricantTypesController(ILubricantTypeService lubricantTypeService)
    {
        _lubricantTypeService = lubricantTypeService;
    }

    /// <summary>
    /// Получить список всех типов смазки.
    /// </summary>
    /// <returns>Список типов смазки.</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<LubricantTypeDto>>> GetAll()
    {
        var types = await _lubricantTypeService.GetAllAsync();
        return Ok(types);
    }

    /// <summary>
    /// Получить тип смазки по идентификатору.
    /// </summary>
    /// <param name="id">Идентификатор типа смазки.</param>
    /// <returns>Тип смазки.</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LubricantTypeDto>> GetById(int id)
    {
        var type = await _lubricantTypeService.GetByIdAsync(id);
        if (type == null)
            return NotFound();
        return Ok(type);
    }

    /// <summary>
    /// Создать новый тип смазки.
    /// </summary>
    /// <param name="dto">Данные для создания.</param>
    /// <returns>Созданный тип смазки.</returns>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LubricantTypeDto>> Create([FromBody] CreateLubricantTypeDto dto)
    {
        try
        {
            var created = await _lubricantTypeService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Обновить тип смазки.
    /// </summary>
    /// <param name="id">Идентификатор типа смазки.</param>
    /// <param name="dto">Новые данные.</param>
    /// <returns>Обновлённый тип смазки.</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LubricantTypeDto>> Update(int id, [FromBody] UpdateLubricantTypeDto dto)
    {
        try
        {
            var updated = await _lubricantTypeService.UpdateAsync(id, dto);
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
    /// Удалить тип смазки.
    /// </summary>
    /// <param name="id">Идентификатор типа смазки.</param>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _lubricantTypeService.DeleteAsync(id);
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