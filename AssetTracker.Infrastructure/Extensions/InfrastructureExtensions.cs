using AssetTracker.Domain.Interfaces;
using AssetTracker.Infrastructure.Data;
using AssetTracker.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AssetTracker.Infrastructure.Extensions;

public static class InfrastructureExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)));

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IMotorRepository, MotorRepository>();
        services.AddScoped<ILocationHistoryRepository, LocationHistoryRepository>();
        services.AddScoped<IMaintenanceLogRepository, MaintenanceLogRepository>();

        return services;
    }
}