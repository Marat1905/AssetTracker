using AssetTracker.Domain.Interfaces;
using AssetTracker.Infrastructure.Data;
using AssetTracker.Infrastructure.Repositories;

/// <summary>
/// Реализация Unit of Work для объединения репозиториев и управления транзакциями.
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;
    private IMotorRepository? _motorRepository;
    private ILocationHistoryRepository? _locationHistoryRepository;
    private IMaintenanceLogRepository? _maintenanceLogRepository;
    private ILubricantTypeRepository? _lubricantTypeRepository;
    private IBearingRepository? _bearingRepository;

    public UnitOfWork(AppDbContext context) => _context = context;

    /// <inheritdoc />
    public IMotorRepository Motors => _motorRepository ??= new MotorRepository(_context);

    /// <inheritdoc />
    public ILocationHistoryRepository LocationHistories => _locationHistoryRepository ??= new LocationHistoryRepository(_context);

    /// <inheritdoc />
    public IMaintenanceLogRepository MaintenanceLogs => _maintenanceLogRepository ??= new MaintenanceLogRepository(_context);

    /// <inheritdoc />
    public ILubricantTypeRepository LubricantTypes => _lubricantTypeRepository ??= new LubricantTypeRepository(_context);

    /// <inheritdoc />
    public IBearingRepository Bearings => _bearingRepository ??= new BearingRepository(_context);

    /// <inheritdoc />
    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await _context.SaveChangesAsync(cancellationToken);

    /// <inheritdoc />
    public void Dispose() => _context.Dispose();
}