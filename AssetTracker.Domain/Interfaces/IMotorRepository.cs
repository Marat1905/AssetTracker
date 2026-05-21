using AssetTracker.Domain.Entities;

namespace AssetTracker.Domain.Interfaces;

/// <summary>
/// Репозиторий для сущности <see cref="Motor"/>.
/// </summary>
public interface IMotorRepository : IRepository<Motor>
{
    /// <summary>
    /// Возвращает двигатель с полной историей (перемещения и обслуживание).
    /// </summary>
    /// <param name="inventoryNumber">Инвентарный номер двигателя.</param>
    /// <param name="cancellationToken">Токен отмены.</param>
    /// <returns>Двигатель с загруженными навигационными свойствами или null.</returns>
    Task<Motor?> GetWithFullHistoryAsync(int inventoryNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Возвращает запрос IQueryable для сущностей двигателей.
    /// </summary>
    IQueryable<Motor> GetQueryable();
}