using AssetTracker.Domain.Entities;
using AssetTracker.Domain.Interfaces;
using AssetTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AssetTracker.Infrastructure.Repositories;

/// <summary>
/// Репозиторий для сущности <see cref="LubricantType"/>.
/// </summary>
public class LubricantTypeRepository : Repository<LubricantType>, ILubricantTypeRepository
{
    public LubricantTypeRepository(AppDbContext context) : base(context) { }

    /// <inheritdoc />
    public IQueryable<LubricantType> GetQueryable() => _dbSet;

    /// <inheritdoc />
    public async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
        => await _dbSet.AnyAsync(lt => lt.Id == id, cancellationToken);
}