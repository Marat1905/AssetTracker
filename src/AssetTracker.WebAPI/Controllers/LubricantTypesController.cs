using AssetTracker.Application.DTOs;
using AssetTracker.Application.Interfaces;
using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssetTracker.WebAPI.Controllers;

/// <summary>
/// Контроллер для управления типами смазки.
/// </summary>
[ApiVersion("1.0")]
[ApiController]
[Route("motor/api/v{version:apiVersion}/[controller]")]
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
    /// <param name="cancellationToken">Токен отмены запроса.</param>
    /// <returns>Список типов смазки.</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<LubricantTypeDto>>> GetAll(CancellationToken cancellationToken = default)
    {
        var types = await _lubricantTypeService.GetAllAsync(cancellationToken);
        return Ok(types);
    }

    /// <summary>
    /// Получить тип смазки по идентификатору.
    /// </summary>
    /// <param name="id">Идентификатор типа смазки.</param>
    /// <param name="cancellationToken">Токен отмены запроса.</param>
    /// <returns>Тип смазки.</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LubricantTypeDto>> GetById(int id, CancellationToken cancellationToken = default)
    {
        var type = await _lubricantTypeService.GetByIdAsync(id, cancellationToken);
        if (type == null)
            return NotFound();
        return Ok(type);
    }

    /// <summary>
    /// Создать новый тип смазки.
    /// </summary>
    /// <param name="dto">Данные для создания.</param>
    /// <param name="cancellationToken">Токен отмены запроса.</param>
    /// <returns>Созданный тип смазки.</returns>
    //[Authorize(Policy = "Electro")]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LubricantTypeDto>> Create([FromBody] CreateLubricantTypeDto dto, CancellationToken cancellationToken = default)
    {
        try
        {
            var created = await _lubricantTypeService.CreateAsync(dto, cancellationToken);
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
    /// <param name="cancellationToken">Токен отмены запроса.</param>
    /// <returns>Обновлённый тип смазки.</returns>
    //[Authorize(Policy = "Electro")]
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LubricantTypeDto>> Update(int id, [FromBody] UpdateLubricantTypeDto dto, CancellationToken cancellationToken = default)
    {
        try
        {
            var updated = await _lubricantTypeService.UpdateAsync(id, dto, cancellationToken);
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
    /// <param name="cancellationToken">Токен отмены запроса.</param>
    //[Authorize(Policy = "Electro")]
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            await _lubricantTypeService.DeleteAsync(id, cancellationToken);
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