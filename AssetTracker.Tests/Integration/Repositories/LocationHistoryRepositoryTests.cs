using AssetTracker.Domain.Entities;
using AssetTracker.Domain.Enums;
using AssetTracker.Infrastructure.Data;
using AssetTracker.Infrastructure.Repositories;
using AssetTracker.Tests.Fixtures;
using AssetTracker.Tests.Helpers;
using Microsoft.EntityFrameworkCore;

namespace AssetTracker.Tests.Integration.Repositories;

public class LocationHistoryRepositoryTests : IClassFixture<TestContainersFixture>, IAsyncLifetime
{
    private readonly TestContainersFixture _fixture;
    private AppDbContext _context = null!;
    private LocationHistoryRepository _repository = null!;
    private int _motorId;

    public LocationHistoryRepositoryTests(TestContainersFixture fixture)
    {
        _fixture = fixture;
    }

    public async Task InitializeAsync()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(_fixture.ConnectionString)
            .Options;
        _context = new AppDbContext(options);
        await DatabaseCleaner.CleanDatabaseAsync(_context);
        _repository = new LocationHistoryRepository(_context);
        _motorId = await SeedMotor();
    }

    public async Task DisposeAsync()
    {
        await _context.DisposeAsync();
    }

    private async Task<int> SeedMotor()
    {
        var front = new Bearing { Type = "6204", Manufacturer = "X", Supplier = "Y" };
        var rear = new Bearing { Type = "6204", Manufacturer = "X", Supplier = "Y" };
        await _context.Bearings.AddRangeAsync(front, rear);
        await _context.SaveChangesAsync();

        var motor = new Motor
        {
            InventoryNumber = "8001", // строка
            Type = "MotorForLocTest",
            ShaftDiameter = 25,
            Power = 5,
            Speed = 1000,
            FrontBearingId = front.Id,
            RearBearingId = rear.Id,
            Status = MotorStatus.Reserve,
            MountingType = MountingType.Flange
        };
        await _context.Motors.AddAsync(motor);
        await _context.SaveChangesAsync();
        return motor.Id;
    }

    [Fact]
    public async Task GetActiveLocationAsync_ShouldReturnCurrentLocation()
    {
        // Arrange
        var active = new LocationHistory
        {
            MotorId = _motorId,
            Location = "ActivePlace",
            StartDate = DateTime.UtcNow,
            EndDate = null,
            Status = MotorStatus.Reserve
        };
        var closed = new LocationHistory
        {
            MotorId = _motorId,
            Location = "OldPlace",
            StartDate = DateTime.UtcNow.AddDays(-5),
            EndDate = DateTime.UtcNow.AddDays(-1),
            Status = MotorStatus.InOperation
        };
        await _context.LocationHistories.AddRangeAsync(active, closed);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetActiveLocationAsync(_motorId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("ActivePlace", result.Location);
        Assert.Null(result.EndDate);
    }

    [Fact]
    public async Task GetActiveLocationAsync_NoActive_ShouldReturnNull()
    {
        // Arrange
        var closed = new LocationHistory
        {
            MotorId = _motorId,
            Location = "OldPlace",
            StartDate = DateTime.UtcNow.AddDays(-5),
            EndDate = DateTime.UtcNow,
            Status = MotorStatus.InOperation
        };
        await _context.LocationHistories.AddAsync(closed);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetActiveLocationAsync(_motorId);

        // Assert
        Assert.Null(result);
    }
}