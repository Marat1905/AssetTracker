using AssetTracker.Domain.Entities;
using AssetTracker.Domain.Interfaces;
using AssetTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AssetTracker.Infrastructure.Repositories;

public class LocationHistoryRepository : Repository<LocationHistory>, ILocationHistoryRepository
{
    public LocationHistoryRepository(AppDbContext context) : base(context) { }

    public async Task<LocationHistory?> GetActiveLocationAsync(int motorId, CancellationToken cancellationToken = default)
    {
        return await _context.LocationHistories
            .FirstOrDefaultAsync(l => l.MotorId == motorId && l.EndDate == null, cancellationToken);
    }

    public IQueryable<LocationHistory> GetQueryable() => _dbSet;
}