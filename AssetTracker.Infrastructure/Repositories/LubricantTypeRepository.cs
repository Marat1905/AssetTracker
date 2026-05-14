using AssetTracker.Domain.Entities;
using AssetTracker.Domain.Interfaces;
using AssetTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AssetTracker.Infrastructure.Repositories;

public class LubricantTypeRepository : Repository<LubricantType>, ILubricantTypeRepository
{
    public LubricantTypeRepository(AppDbContext context) : base(context) { }

    public IQueryable<LubricantType> GetQueryable() => _dbSet;

    public async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
        => await _dbSet.AnyAsync(lt => lt.Id == id, cancellationToken);
}