using AssetTracker.Application.DTOs;

namespace AssetTracker.Application.Interfaces;

/// <summary>
/// Сервис для управления типами смазки.
/// </summary>
public interface ILubricantTypeService
{
    /// <summary>Получить все типы смазки.</summary>
    /// <param name="cancellationToken">Токен отмены.</param>
    Task<IEnumerable<LubricantTypeDto>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>Получить тип смазки по идентификатору.</summary>
    /// <param name="id">Идентификатор.</param>
    /// <param name="cancellationToken">Токен отмены.</param>
    Task<LubricantTypeDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>Создать новый тип смазки.</summary>
    /// <param name="dto">Данные для создания.</param>
    /// <param name="cancellationToken">Токен отмены.</param>
    Task<LubricantTypeDto> CreateAsync(CreateLubricantTypeDto dto, CancellationToken cancellationToken = default);

    /// <summary>Обновить тип смазки.</summary>
    /// <param name="id">Идентификатор.</param>
    /// <param name="dto">Новые данные.</param>
    /// <param name="cancellationToken">Токен отмены.</param>
    Task<LubricantTypeDto> UpdateAsync(int id, UpdateLubricantTypeDto dto, CancellationToken cancellationToken = default);

    /// <summary>Удалить тип смазки.</summary>
    /// <param name="id">Идентификатор.</param>
    /// <param name="cancellationToken">Токен отмены.</param>
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}