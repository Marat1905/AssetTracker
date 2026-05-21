using AssetTracker.Domain.Entities;
using AssetTracker.Domain.Interfaces;
using AssetTracker.Infrastructure.Data;

namespace AssetTracker.Infrastructure.Repositories;

/// <summary>
/// Репозиторий для сущности <see cref="Bearing"/>.
/// </summary>
public class BearingRepository : Repository<Bearing>, IBearingRepository
{
    public BearingRepository(AppDbContext context) : base(context) { }

    /// <inheritdoc />
    public IQueryable<Bearing> GetQueryable() => _dbSet;
}