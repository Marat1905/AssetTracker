using AssetTracker.Application.DTOs;
using AssetTracker.Application.Services;
using AssetTracker.Domain.Entities;
using AssetTracker.Domain.Enums;
using AssetTracker.Domain.Interfaces;
using AssetTracker.Infrastructure.Data;
using AssetTracker.Infrastructure.Repositories;
using AssetTracker.Tests.Fixtures;
using AssetTracker.Tests.Helpers;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;

namespace AssetTracker.Tests.Integration.Services;

public class MotorServiceIntegrationTests : IClassFixture<TestContainersFixture>, IAsyncLifetime
{
    private readonly TestContainersFixture _fixture;
    private AppDbContext _context = null!;
    private IUnitOfWork _unitOfWork = null!;
    private IMapper _mapper = null!;
    private MotorService _service = null!;

    public MotorServiceIntegrationTests(TestContainersFixture fixture)
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

        var services = new ServiceCollection();
        services.AddScoped(_ => _context);
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IMotorRepository, MotorRepository>();
        services.AddScoped<ILocationHistoryRepository, LocationHistoryRepository>();
        services.AddScoped<IMaintenanceLogRepository, MaintenanceLogRepository>();
        services.AddScoped<ILubricantTypeRepository, LubricantTypeRepository>();
        services.AddScoped<IBearingRepository, BearingRepository>();

        var serviceProvider = services.BuildServiceProvider();
        _unitOfWork = serviceProvider.GetRequiredService<IUnitOfWork>();
        _mapper = MapperHelper.CreateMapper();
        _service = new MotorService(_unitOfWork, _mapper, NullLogger<MotorService>.Instance);

        // Добавляем базовые типы смазки
        var lubricantTypes = new[]
        {
            new LubricantType { Name = "Литол-24", Description = "Тестовая смазка" },
            new LubricantType { Name = "ЦИАТИМ-221", Description = "Высокотемпературная" }
        };
        await _context.LubricantTypes.AddRangeAsync(lubricantTypes);
        await _context.SaveChangesAsync();
    }

    public async Task DisposeAsync()
    {
        await _context.DisposeAsync();
    }

    [Fact]
    public async Task CreateMotorAsync_ShouldPersistMotorAndLocation()
    {
        var dto = TestDataFactory.CreateValidCreateMotorDto("7777");
        var result = await _service.CreateMotorAsync(dto);

        var motorInDb = await _context.Motors
            .Include(m => m.FrontBearing)
            .Include(m => m.RearBearing)
            .FirstOrDefaultAsync(m => m.InventoryNumber == "7777");
        Assert.NotNull(motorInDb);
        Assert.Equal("АИР100L4", motorInDb.Type);
        Assert.Equal(28, motorInDb.ShaftDiameter);
        Assert.Equal(5.5, motorInDb.Power);
        Assert.Equal(1500, motorInDb.Speed);
        Assert.Equal(MotorStatus.InOperation, motorInDb.Status);

        var locationInDb = await _context.LocationHistories
            .FirstOrDefaultAsync(l => l.MotorId == motorInDb.Id && l.EndDate == null);
        Assert.NotNull(locationInDb);
        Assert.Equal("Цех №1", locationInDb.Location);
        Assert.Equal(MotorStatus.InOperation, locationInDb.Status);
    }

    [Fact]
    public async Task MoveMotorAsync_ShouldCloseActiveLocationAndCreateNew()
    {
        var createDto = TestDataFactory.CreateValidCreateMotorDto("8888");
        var created = await _service.CreateMotorAsync(createDto);
        int motorId = created.Id;

        var moveDto = new MoveMotorDto
        {
            NewLocation = "Цех №2 (ремонт)",
            NewStatus = MotorStatus.Repair
        };

        await _service.MoveMotorAsync(motorId, moveDto);

        var motor = await _context.Motors.FirstAsync(m => m.Id == motorId);
        Assert.Equal(MotorStatus.Repair, motor.Status);

        var histories = await _context.LocationHistories
            .Where(l => l.MotorId == motorId)
            .OrderBy(l => l.StartDate)
            .ToListAsync();
        Assert.Equal(2, histories.Count);
        Assert.NotNull(histories[0].EndDate);
        Assert.Null(histories[1].EndDate);
        Assert.Equal("Цех №2 (ремонт)", histories[1].Location);
    }

    [Fact]
    public async Task AddMaintenanceAsync_Lubrication_ShouldCreateLog()
    {
        var createDto = TestDataFactory.CreateValidCreateMotorDto("9999");
        var created = await _service.CreateMotorAsync(createDto);
        int motorId = created.Id;

        var lubricantType = await _context.LubricantTypes.FirstAsync();
        var maintenanceDto = TestDataFactory.CreateLubricationDto(lubricantType.Id, BearingPosition.Front);

        await _service.AddMaintenanceAsync(motorId, maintenanceDto);

        var log = await _context.MaintenanceLogs
            .Include(l => l.LubricantType)
            .FirstOrDefaultAsync(l => l.MotorId == motorId);
        Assert.NotNull(log);
        Assert.Equal(MaintenanceType.Lubrication, log.WorkType);
        Assert.Equal(lubricantType.Name, log.LubricantType?.Name);
        Assert.Equal(BearingPosition.Front, log.BearingPosition);
    }

    [Fact]
    public async Task AddMaintenanceAsync_BearingReplacement_ShouldUpdateMotorBearing()
    {
        var createDto = TestDataFactory.CreateValidCreateMotorDto("1111");
        var created = await _service.CreateMotorAsync(createDto);
        int motorId = created.Id;

        var newBearingDto = TestDataFactory.CreateBearingReplacementWithNewBearingDto(BearingPosition.Rear);

        await _service.AddMaintenanceAsync(motorId, newBearingDto);

        var motor = await _context.Motors
            .Include(m => m.RearBearing)
            .FirstAsync(m => m.Id == motorId);
        Assert.Equal("6306", motor.RearBearing.Type);

        var log = await _context.MaintenanceLogs
            .FirstOrDefaultAsync(l => l.MotorId == motorId && l.WorkType == MaintenanceType.BearingReplacement);
        Assert.NotNull(log);
        Assert.Equal(BearingPosition.Rear, log.BearingPosition);
        Assert.NotNull(log.NewBearing);
    }

    [Fact]
    public async Task GetFullHistoryAsync_ShouldReturnCompleteHistory()
    {
        var createDto = TestDataFactory.CreateValidCreateMotorDto("2222");
        var created = await _service.CreateMotorAsync(createDto);
        int motorId = created.Id;

        await _service.MoveMotorAsync(motorId, new MoveMotorDto { NewLocation = "Цех 10" });
        var lubricantType = await _context.LubricantTypes.FirstAsync();
        await _service.AddMaintenanceAsync(motorId, TestDataFactory.CreateLubricationDto(lubricantType.Id, BearingPosition.Rear));

        var history = await _service.GetFullHistoryAsync(motorId);

        Assert.Equal(motorId, history.Id);
        Assert.Equal("2222", history.InventoryNumber);
        Assert.Equal(2, history.LocationHistory.Count);
        Assert.Single(history.MaintenanceLogs);
        Assert.Equal(MaintenanceType.Lubrication.ToString(), history.MaintenanceLogs.First().WorkType);
    }

    [Fact]
    public async Task UpdateMotorAsync_ShouldModifyCharacteristics()
    {
        var createDto = TestDataFactory.CreateValidCreateMotorDto("3333");
        var created = await _service.CreateMotorAsync(createDto);
        int motorId = created.Id;

        var updateDto = TestDataFactory.CreateValidUpdateMotorDto();

        await _service.UpdateMotorAsync(motorId, updateDto);

        var motor = await _context.Motors.FirstAsync(m => m.Id == motorId);
        Assert.Equal(updateDto.Type, motor.Type);
        Assert.Equal(updateDto.ShaftDiameter, motor.ShaftDiameter);
        Assert.Equal(updateDto.Power, motor.Power);
        Assert.Equal(updateDto.Speed, motor.Speed);
        Assert.Equal(updateDto.Status, motor.Status);
        Assert.Equal(updateDto.MountingType, motor.MountingType);
    }

    [Fact]
    public async Task DeleteMotorAsync_ShouldRemoveMotorAndRelatedData()
    {
        var createDto = TestDataFactory.CreateValidCreateMotorDto("4444");
        var created = await _service.CreateMotorAsync(createDto);
        int motorId = created.Id;

        var lubricantType = await _context.LubricantTypes.FirstAsync();
        await _service.AddMaintenanceAsync(motorId, TestDataFactory.CreateLubricationDto(lubricantType.Id, BearingPosition.Front));

        await _service.DeleteMotorAsync(motorId);

        var motor = await _context.Motors.FirstOrDefaultAsync(m => m.Id == motorId);
        Assert.Null(motor);
        var locations = await _context.LocationHistories.AnyAsync(l => l.MotorId == motorId);
        Assert.False(locations);
        var logs = await _context.MaintenanceLogs.AnyAsync(l => l.MotorId == motorId);
        Assert.False(logs);
    }

    [Fact]
    public async Task GetMotorsPagedAsync_ShouldReturnFilteredAndPagedResults()
    {
        // Создаём двигатели с инвентарными номерами как строки
        for (int i = 100; i < 110; i++)
        {
            var dto = TestDataFactory.CreateValidCreateMotorDto(i.ToString());
            dto.InitialLocation = "LocationX";
            await _service.CreateMotorAsync(dto);
        }
        for (int i = 200; i < 210; i++)
        {
            var dto = TestDataFactory.CreateValidCreateMotorDto(i.ToString());
            dto.InitialLocation = "LocationY";
            await _service.CreateMotorAsync(dto);
        }

        // Act
        var page1 = await _service.GetMotorsPagedAsync(1, 5, null, null, null);
        var page2 = await _service.GetMotorsPagedAsync(2, 5, null, null, null);
        var filteredByInventory = await _service.GetMotorsPagedAsync(1, 100, "10", null, null);
        var filteredByLocation = await _service.GetMotorsPagedAsync(1, 100, null, "LocationX", null);

        // Assert
        Assert.Equal(20, page1.TotalCount);
        Assert.Equal(5, page1.Items.Count());
        Assert.Equal(5, page2.Items.Count());
        Assert.Equal(10, filteredByInventory.Items.Count());
        Assert.Equal(10, filteredByLocation.Items.Count());
    }
}