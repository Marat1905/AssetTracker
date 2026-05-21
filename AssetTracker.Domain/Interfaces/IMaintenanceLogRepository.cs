using AssetTracker.Domain.Entities;

namespace AssetTracker.Domain.Interfaces;

/// <summary>
/// Репозиторий для сущности <see cref="MaintenanceLog"/>.
/// </summary>
public interface IMaintenanceLogRepository : IRepository<MaintenanceLog>
{
    /// <summary>
    /// Возвращает запрос IQueryable для сущностей журнала обслуживания.
    /// </summary>
    IQueryable<MaintenanceLog> GetQueryable();
}