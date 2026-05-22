using AssetTracker.Domain.Interfaces;
using AssetTracker.Infrastructure.Data;
using AssetTracker.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace AssetTracker.Tests.Fixtures;

/// <summary>
/// Фикстура, предоставляющая чистый экземпляр DbContext для каждого теста.
/// </summary>
public class DatabaseFixture : IAsyncLifetime
{
    private readonly TestContainersFixture _containers;
    public AppDbContext Context { get; private set; } = null!;
    public IServiceProvider ServiceProvider { get; private set; } = null!;

    public DatabaseFixture()
    {
        _containers = new TestContainersFixture();
    }

    public async Task InitializeAsync()
    {
        await _containers.InitializeAsync();
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(_containers.ConnectionString)
            .Options;
        Context = new AppDbContext(options);

        // Настраиваем DI провайдер для сервисов (если нужно)
        var services = new ServiceCollection();
        services.AddScoped(_ => Context);
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IMotorRepository, MotorRepository>();
        services.AddScoped<ILocationHistoryRepository, LocationHistoryRepository>();
        services.AddScoped<IMaintenanceLogRepository, MaintenanceLogRepository>();
        services.AddScoped<ILubricantTypeRepository, LubricantTypeRepository>();
        services.AddScoped<IBearingRepository, BearingRepository>();

        ServiceProvider = services.BuildServiceProvider();

        await Context.Database.EnsureCreatedAsync();
    }

    public async Task DisposeAsync()
    {
        await Context.DisposeAsync();
        await _containers.DisposeAsync();
    }

    /// <summary>
    /// Очищает все таблицы между тестами
    /// </summary>
    public async Task CleanDatabaseAsync()
    {
        await Context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE \"MaintenanceLogs\", \"LocationHistories\", \"Motors\", \"Bearings\", \"LubricantTypes\" RESTART IDENTITY CASCADE;");
    }
}