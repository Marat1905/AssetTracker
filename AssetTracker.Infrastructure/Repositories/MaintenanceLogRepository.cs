using AssetTracker.Domain.Entities;
using AssetTracker.Domain.Interfaces;
using AssetTracker.Infrastructure.Data;

namespace AssetTracker.Infrastructure.Repositories;

public class MaintenanceLogRepository : Repository<MaintenanceLog>, IMaintenanceLogRepository
{
    public MaintenanceLogRepository(AppDbContext context) : base(context) { }

    public IQueryable<MaintenanceLog> GetQueryable() => _dbSet;
}