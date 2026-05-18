using AssetTracker.Domain.Interfaces;
using AssetTracker.Infrastructure.Data;

namespace AssetTracker.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;
    private IMotorRepository? _motorRepository;
    private ILocationHistoryRepository? _locationHistoryRepository;
    private IMaintenanceLogRepository? _maintenanceLogRepository;
    private ILubricantTypeRepository? _lubricantTypeRepository;
    private IBearingRepository? _bearingRepository; // новое

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
    }

    public IMotorRepository Motors => _motorRepository ??= new MotorRepository(_context);
    public ILocationHistoryRepository LocationHistories => _locationHistoryRepository ??= new LocationHistoryRepository(_context);
    public IMaintenanceLogRepository MaintenanceLogs => _maintenanceLogRepository ??= new MaintenanceLogRepository(_context);
    public ILubricantTypeRepository LubricantTypes => _lubricantTypeRepository ??= new LubricantTypeRepository(_context);
    public IBearingRepository Bearings => _bearingRepository ??= new BearingRepository(_context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await _context.SaveChangesAsync(cancellationToken);

    public void Dispose() => _context.Dispose();
}