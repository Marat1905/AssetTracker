using AssetTracker.Domain.Entities;
using AssetTracker.Domain.Interfaces;
using AssetTracker.Infrastructure.Data;

namespace AssetTracker.Infrastructure.Repositories;

public class BearingRepository : Repository<Bearing>, IBearingRepository
{
    public BearingRepository(AppDbContext context) : base(context) { }

    public IQueryable<Bearing> GetQueryable() => _dbSet;
}