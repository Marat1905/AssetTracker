using AssetTracker.Domain.Entities;

namespace AssetTracker.Domain.Interfaces;

public interface IBearingRepository : IRepository<Bearing>
{
    IQueryable<Bearing> GetQueryable();
}