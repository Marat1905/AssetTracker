using AssetTracker.Application.DTOs;
using AssetTracker.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AssetTracker.WebAPI.Controllers;

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
    /// Получить список всех типов смазки
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<LubricantTypeDto>>> GetAll()
    {
        var types = await _lubricantTypeService.GetAllAsync();
        return Ok(types);
    }

    /// <summary>
    /// Получить тип смазки по Id
    /// </summary>
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
    /// Создать новый тип смазки
    /// </summary>
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
    /// Обновить тип смазки
    /// </summary>
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
    /// Удалить тип смазки
    /// </summary>
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