using AssetTracker.Domain.Interfaces;

/// <summary>
/// Unit of Work для управления репозиториями и сохранением изменений.
/// </summary>
public interface IUnitOfWork : IDisposable
{
    /// <summary>Репозиторий двигателей.</summary>
    IMotorRepository Motors { get; }

    /// <summary>Репозиторий истории перемещений.</summary>
    ILocationHistoryRepository LocationHistories { get; }

    /// <summary>Репозиторий журнала обслуживания.</summary>
    IMaintenanceLogRepository MaintenanceLogs { get; }

    /// <summary>Репозиторий типов смазки.</summary>
    ILubricantTypeRepository LubricantTypes { get; }

    /// <summary>Репозиторий подшипников.</summary>
    IBearingRepository Bearings { get; }

    /// <summary>Сохранить все изменения в базе данных.</summary>
    /// <param name="cancellationToken">Токен отмены.</param>
    /// <returns>Количество затронутых записей.</returns>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}