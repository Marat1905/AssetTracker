using AssetTracker.Application.DTOs;

namespace AssetTracker.Application.Interfaces;

/// <summary>
/// Сервис для управления типами смазки.
/// </summary>
public interface ILubricantTypeService
{
    /// <summary>Получить все типы смазки.</summary>
    Task<IEnumerable<LubricantTypeDto>> GetAllAsync();

    /// <summary>Получить тип смазки по идентификатору.</summary>
    Task<LubricantTypeDto?> GetByIdAsync(int id);

    /// <summary>Создать новый тип смазки.</summary>
    Task<LubricantTypeDto> CreateAsync(CreateLubricantTypeDto dto);

    /// <summary>Обновить тип смазки.</summary>
    Task<LubricantTypeDto> UpdateAsync(int id, UpdateLubricantTypeDto dto);

    /// <summary>Удалить тип смазки.</summary>
    Task DeleteAsync(int id);
}