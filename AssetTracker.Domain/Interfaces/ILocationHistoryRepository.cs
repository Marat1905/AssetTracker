using AssetTracker.Domain.Entities;

namespace AssetTracker.Domain.Interfaces;

/// <summary>
/// Репозиторий для сущности <see cref="LocationHistory"/>.
/// </summary>
public interface ILocationHistoryRepository : IRepository<LocationHistory>
{
    /// <summary>
    /// Возвращает активную (не закрытую) запись местоположения для двигателя.
    /// </summary>
    /// <param name="motorId">Инвентарный номер двигателя.</param>
    /// <param name="cancellationToken">Токен отмены.</param>
    /// <returns>Активная запись или null.</returns>
    Task<LocationHistory?> GetActiveLocationAsync(int motorId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Возвращает запрос IQueryable для сущностей истории перемещений.
    /// </summary>
    IQueryable<LocationHistory> GetQueryable();
}