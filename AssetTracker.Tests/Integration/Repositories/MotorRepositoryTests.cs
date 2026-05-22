using AssetTracker.Domain.Entities;
using AssetTracker.Domain.Enums;
using AssetTracker.Infrastructure.Data;
using AssetTracker.Infrastructure.Repositories;
using AssetTracker.Tests.Fixtures;
using AssetTracker.Tests.Helpers;
using Microsoft.EntityFrameworkCore;

namespace AssetTracker.Tests.Integration.Repositories;

public class MotorRepositoryTests : IClassFixture<TestContainersFixture>, IAsyncLifetime
{
    private readonly TestContainersFixture _fixture;
    private AppDbContext _context = null!;
    private MotorRepository _repository = null!;

    public MotorRepositoryTests(TestContainersFixture fixture)
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
        _repository = new MotorRepository(_context);
        await SeedData();
    }

    public async Task DisposeAsync()
    {
        await _context.DisposeAsync();
    }

    private async Task SeedData()
    {
        var frontBearing = new Bearing { Type = "6204", Manufacturer = "SKF", Supplier = "A" };
        var rearBearing = new Bearing { Type = "6204", Manufacturer = "SKF", Supplier = "A" };
        await _context.Bearings.AddRangeAsync(frontBearing, rearBearing);
        await _context.SaveChangesAsync();

        var motor = new Motor
        {
            InventoryNumber = 9001,
            Type = "TestMotor",
            ShaftDiameter = 30,
            Power = 11,
            Speed = 1450,
            FrontBearingId = frontBearing.Id,
            RearBearingId = rearBearing.Id,
            Status = MotorStatus.InOperation,
            MountingType = MountingType.Feet
        };
        await _context.Motors.AddAsync(motor);
        await _context.SaveChangesAsync();
    }

    [Fact]
    public async Task GetWithFullHistoryAsync_ShouldIncludeLocationAndMaintenance()
    {
        var motorId = 9001;
        var location = new LocationHistory
        {
            MotorId = motorId,
            Location = "TestLocation",
            StartDate = DateTime.UtcNow,
            Status = MotorStatus.InOperation
        };
        var log = new MaintenanceLog
        {
            MotorId = motorId,
            WorkType = MaintenanceType.Lubrication,
            Date = DateTime.UtcNow,
            PerformedBy = "Tester"
        };
        await _context.LocationHistories.AddAsync(location);
        await _context.MaintenanceLogs.AddAsync(log);
        await _context.SaveChangesAsync();

        var motor = await _repository.GetWithFullHistoryAsync(motorId);

        Assert.NotNull(motor);
        Assert.Single(motor.LocationHistories);
        Assert.Single(motor.MaintenanceLogs);
        Assert.Equal("TestLocation", motor.LocationHistories.First().Location);
    }

    [Fact]
    public async Task GetQueryable_ShouldReturnQueryable()
    {
        var query = _repository.GetQueryable();
        Assert.IsAssignableFrom<IQueryable<Motor>>(query);
        var count = await query.CountAsync();
        Assert.Equal(1, count);
    }
}