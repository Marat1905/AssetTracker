namespace AssetTracker.Domain.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IMotorRepository Motors { get; }
        ILocationHistoryRepository LocationHistories { get; }
        IMaintenanceLogRepository MaintenanceLogs { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
