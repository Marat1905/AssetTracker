using AssetTracker.Domain.Entities;
using AssetTracker.Domain.Interfaces;
using AssetTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AssetTracker.Infrastructure.Repositories;

public class BearingRepository : Repository<Bearing>, IBearingRepository
{
    public BearingRepository(AppDbContext context) : base(context) { }

    public IQueryable<Bearing> GetQueryable() => _dbSet;

    public async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
        => await _dbSet.AnyAsync(b => b.Id == id, cancellationToken);
}