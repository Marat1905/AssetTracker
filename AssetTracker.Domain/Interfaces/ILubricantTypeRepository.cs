using AssetTracker.Domain.Entities;

namespace AssetTracker.Domain.Interfaces;

public interface ILubricantTypeRepository : IRepository<LubricantType>
{
    IQueryable<LubricantType> GetQueryable();
    Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);
}