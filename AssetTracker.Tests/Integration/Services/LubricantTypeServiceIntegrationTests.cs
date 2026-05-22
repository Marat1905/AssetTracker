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

public class LubricantTypeServiceIntegrationTests : IClassFixture<TestContainersFixture>, IAsyncLifetime
{
    private readonly TestContainersFixture _fixture;
    private AppDbContext _context = null!;
    private IUnitOfWork _unitOfWork = null!;
    private IMapper _mapper = null!;
    private LubricantTypeService _service = null!;

    public LubricantTypeServiceIntegrationTests(TestContainersFixture fixture)
    {
        _fixture = fixture;
    }

    public async Task InitializeAsync()
    {
        // Создаём новый контекст для каждого теста
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(_fixture.ConnectionString)
            .Options;
        _context = new AppDbContext(options);
        await DatabaseCleaner.CleanDatabaseAsync(_context);

        // Настраиваем DI для UnitOfWork и репозиториев
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
        _service = new LubricantTypeService(_unitOfWork, _mapper, NullLogger<LubricantTypeService>.Instance);
    }

    public async Task DisposeAsync()
    {
        await _context.DisposeAsync();
    }

    [Fact]
    public async Task CreateAndGetAll_ShouldWork()
    {
        var createDto = new CreateLubricantTypeDto { Name = "EP2", Description = "Экстремальное давление" };

        var created = await _service.CreateAsync(createDto);
        var all = await _service.GetAllAsync();

        Assert.True(created.Id > 0);
        Assert.Single(all);
        Assert.Equal("EP2", all.First().Name);
    }

    [Fact]
    public async Task CreateMultiple_ShouldWork()
    {
        var dto1 = new CreateLubricantTypeDto { Name = "Lube1" };
        var dto2 = new CreateLubricantTypeDto { Name = "Lube2" };

        await _service.CreateAsync(dto1);
        await _service.CreateAsync(dto2);
        var all = await _service.GetAllAsync();

        Assert.Equal(2, all.Count());
    }

    [Fact]
    public async Task Update_ShouldModify()
    {
        var createDto = new CreateLubricantTypeDto { Name = "OldName", Description = "OldDesc" };
        var created = await _service.CreateAsync(createDto);
        var updateDto = new UpdateLubricantTypeDto { Name = "NewName", Description = "NewDesc" };

        var updated = await _service.UpdateAsync(created.Id, updateDto);

        Assert.Equal("NewName", updated.Name);
        Assert.Equal("NewDesc", updated.Description);

        var fromDb = await _context.LubricantTypes.FindAsync(created.Id);
        Assert.Equal("NewName", fromDb?.Name);
    }

    [Fact]
    public async Task Delete_NotUsed_ShouldRemove()
    {
        var createDto = new CreateLubricantTypeDto { Name = "ToDelete" };
        var created = await _service.CreateAsync(createDto);

        await _service.DeleteAsync(created.Id);

        var fromDb = await _context.LubricantTypes.FindAsync(created.Id);
        Assert.Null(fromDb);
    }

    [Fact]
    public async Task Delete_UsedInMaintenance_ShouldThrow()
    {
        var createDto = new CreateLubricantTypeDto { Name = "UsedLube" };
        var lube = await _service.CreateAsync(createDto);

        // Создаём мотор и добавляем смазку
        var motorService = new MotorService(_unitOfWork, _mapper, NullLogger<MotorService>.Instance);
        var motorDto = TestDataFactory.CreateValidCreateMotorDto(5000);
        await motorService.CreateMotorAsync(motorDto);
        var maintenanceDto = TestDataFactory.CreateLubricationDto(lube.Id, BearingPosition.Front);
        await motorService.AddMaintenanceAsync(5000, maintenanceDto);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteAsync(lube.Id));
    }
}