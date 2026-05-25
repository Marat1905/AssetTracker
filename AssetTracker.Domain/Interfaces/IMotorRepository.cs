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
    /// <param name="id">Суррогатный идентификатор двигателя.</param>
    /// <param name="cancellationToken">Токен отмены.</param>
    /// <returns>Двигатель с загруженными навигационными свойствами или null.</returns>
    Task<Motor?> GetWithFullHistoryAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Возвращает двигатель по его инвентарному номеру (если задан).
    /// </summary>
    /// <param name="inventoryNumber">Инвентарный номер.</param>
    /// <param name="cancellationToken">Токен отмены.</param>
    /// <returns>Двигатель или null.</returns>
    Task<Motor?> GetByInventoryNumberAsync(string inventoryNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Возвращает запрос IQueryable для сущностей двигателей.
    /// </summary>
    IQueryable<Motor> GetQueryable();
}