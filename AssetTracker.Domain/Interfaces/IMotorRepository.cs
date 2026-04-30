using AssetTracker.Domain.Entities;

namespace AssetTracker.Domain.Interfaces
{
    public interface IMotorRepository : IRepository<Motor>
    {
        Task<Motor?> GetWithFullHistoryAsync(int inventoryNumber, CancellationToken cancellationToken = default);
    }
}
