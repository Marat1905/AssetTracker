using AssetTracker.Domain.Entities;
using AssetTracker.Domain.Interfaces;
using AssetTracker.Infrastructure.Data;

namespace AssetTracker.Infrastructure.Repositories;

/// <summary>
/// Репозиторий для сущности <see cref="MaintenanceLog"/>.
/// </summary>
public class MaintenanceLogRepository : Repository<MaintenanceLog>, IMaintenanceLogRepository
{
    public MaintenanceLogRepository(AppDbContext context) : base(context) { }

    /// <inheritdoc />
    public IQueryable<MaintenanceLog> GetQueryable() => _dbSet;
}