using AssetTracker.Domain.Entities;
using AssetTracker.Domain.Interfaces;
using AssetTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AssetTracker.Infrastructure.Repositories;

/// <summary>
/// Репозиторий для сущности <see cref="Motor"/>.
/// </summary>
public class MotorRepository : Repository<Motor>, IMotorRepository
{
    public MotorRepository(AppDbContext context) : base(context) { }

    /// <inheritdoc />
    public async Task<Motor?> GetWithFullHistoryAsync(int inventoryNumber, CancellationToken cancellationToken = default)
    {
        return await _context.Motors
            .Include(m => m.LocationHistories)
            .Include(m => m.MaintenanceLogs)
            .FirstOrDefaultAsync(m => m.InventoryNumber == inventoryNumber, cancellationToken);
    }

    /// <inheritdoc />
    public IQueryable<Motor> GetQueryable() => _dbSet;
}