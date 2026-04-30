using AssetTracker.Domain.Entities;

namespace AssetTracker.Domain.Interfaces
{
    public interface ILocationHistoryRepository : IRepository<LocationHistory>
    {
        Task<LocationHistory?> GetActiveLocationAsync(int motorId, CancellationToken cancellationToken = default);
    }
}
