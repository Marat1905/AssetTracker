using AssetTracker.Infrastructure.Data;
using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using Microsoft.EntityFrameworkCore;
using Testcontainers.PostgreSql;

namespace AssetTracker.Tests.Fixtures;

/// <summary>
/// Фикстура для запуска PostgreSQL контейнера и применения миграций.
/// </summary>
public class TestContainersFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgresContainer;
    public string ConnectionString { get; private set; } = string.Empty;

    public TestContainersFixture()
    {
        _postgresContainer = new PostgreSqlBuilder()
            .WithImage("postgres:16-alpine")
            .WithDatabase("asset_tracker_test")
            .WithUsername("test_user")
            .WithPassword("test_password")
            .WithCleanUp(true)
            .Build();
    }

    public async Task InitializeAsync()
    {
        await _postgresContainer.StartAsync();
        ConnectionString = _postgresContainer.GetConnectionString();

        // Применяем миграции (если нужны, иначе создаём схему вручную через EnsureCreated)
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(ConnectionString)
            .Options;

        using var context = new AppDbContext(options);
        await context.Database.EnsureCreatedAsync(); // Создаёт схему без миграций
    }

    public async Task DisposeAsync()
    {
        await _postgresContainer.DisposeAsync();
    }
}