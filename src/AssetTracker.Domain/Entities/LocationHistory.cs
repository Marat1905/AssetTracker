using AssetTracker.Domain.Enums;

namespace AssetTracker.Domain.Entities;

/// <summary>
/// История перемещений электродвигателя (где и когда стоял, с каким статусом).
/// </summary>
public class LocationHistory
{
    /// <summary>Уникальный идентификатор записи.</summary>
    public int Id { get; set; }

    /// <summary>Идентификатор двигателя (внешний ключ на Motor.Id).</summary>
    public int MotorId { get; set; }

    /// <summary>Местоположение (цех/агрегат).</summary>
    public string Location { get; set; } = string.Empty;

    /// <summary>Дата начала нахождения на этом месте.</summary>
    public DateTime StartDate { get; set; }

    /// <summary>Дата окончания нахождения (null – текущее местоположение).</summary>
    public DateTime? EndDate { get; set; }

    /// <summary>Статус двигателя на момент нахождения на этом месте.</summary>
    public MotorStatus Status { get; set; }

    /// <summary>Навигационное свойство к двигателю.</summary>
    public virtual Motor Motor { get; set; } = null!;
}