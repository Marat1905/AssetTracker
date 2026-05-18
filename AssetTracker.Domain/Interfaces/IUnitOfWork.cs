namespace AssetTracker.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IMotorRepository Motors { get; }
    ILocationHistoryRepository LocationHistories { get; }
    IMaintenanceLogRepository MaintenanceLogs { get; }
    ILubricantTypeRepository LubricantTypes { get; }
    IBearingRepository Bearings { get; }  // новый репозиторий
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}