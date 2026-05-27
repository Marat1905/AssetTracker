using AssetTracker.Domain.Interfaces;
using AssetTracker.Infrastructure.Data;
using AssetTracker.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AssetTracker.Infrastructure.Extensions;

/// <summary>
/// Методы расширения для регистрации инфраструктурных сервисов в DI контейнере.
/// </summary>
public static class InfrastructureExtensions
{
    /// <summary>
    /// Добавляет инфраструктурные сервисы (DbContext, UnitOfWork, репозитории) в коллекцию сервисов.
    /// </summary>
    /// <param name="services">Коллекция сервисов.</param>
    /// <param name="configuration">Конфигурация приложения.</param>
    /// <returns>Тот же экземпляр <paramref name="services"/> для цепочки вызовов.</returns>
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)));

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IMotorRepository, MotorRepository>();
        services.AddScoped<ILocationHistoryRepository, LocationHistoryRepository>();
        services.AddScoped<IMaintenanceLogRepository, MaintenanceLogRepository>();
        services.AddScoped<ILubricantTypeRepository, LubricantTypeRepository>();
        services.AddScoped<IBearingRepository, BearingRepository>();

        return services;
    }
}