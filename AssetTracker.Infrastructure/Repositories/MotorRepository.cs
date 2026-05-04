using AssetTracker.Domain.Entities;
using AssetTracker.Domain.Interfaces;
using AssetTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AssetTracker.Infrastructure.Repositories;

public class MotorRepository : Repository<Motor>, IMotorRepository
{
    public MotorRepository(AppDbContext context) : base(context) { }

    public async Task<Motor?> GetWithFullHistoryAsync(int inventoryNumber, CancellationToken cancellationToken = default)
    {
        return await _context.Motors
            .Include(m => m.LocationHistories)
            .Include(m => m.MaintenanceLogs)
            .FirstOrDefaultAsync(m => m.InventoryNumber == inventoryNumber, cancellationToken);
    }

    public IQueryable<Motor> GetQueryable() => _dbSet;
}