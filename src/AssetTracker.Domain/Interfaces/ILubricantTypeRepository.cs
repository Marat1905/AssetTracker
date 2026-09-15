using AssetTracker.Domain.Entities;

namespace AssetTracker.Domain.Interfaces;

/// <summary>
/// Репозиторий для сущности <see cref="LubricantType"/>.
/// </summary>
public interface ILubricantTypeRepository : IRepository<LubricantType>
{
    /// <summary>
    /// Возвращает запрос IQueryable для сущностей типов смазки.
    /// </summary>
    IQueryable<LubricantType> GetQueryable();

    /// <summary>
    /// Проверяет, существует ли тип смазки с указанным идентификатором.
    /// </summary>
    /// <param name="id">Идентификатор типа смазки.</param>
    /// <param name="cancellationToken">Токен отмены.</param>
    /// <returns>True, если существует; иначе false.</returns>
    Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);
}