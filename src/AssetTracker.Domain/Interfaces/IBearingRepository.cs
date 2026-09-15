using AssetTracker.Domain.Entities;

namespace AssetTracker.Domain.Interfaces;

/// <summary>
/// Репозиторий для сущности <see cref="Bearing"/>.
/// </summary>
public interface IBearingRepository : IRepository<Bearing>
{
    /// <summary>
    /// Возвращает запрос IQueryable для сущностей подшипников.
    /// </summary>
    IQueryable<Bearing> GetQueryable();
}