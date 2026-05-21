using AssetTracker.Domain.Enums;

namespace AssetTracker.Domain.Entities;

/// <summary>
/// Журнал обслуживания – запись о выполненной работе (ремонт, смазка, замена подшипника).
/// </summary>
public class MaintenanceLog
{
    /// <summary>Уникальный идентификатор записи.</summary>
    public int Id { get; set; }

    /// <summary>Инвентарный номер двигателя (внешний ключ).</summary>
    public int MotorId { get; set; }

    /// <summary>Тип выполненной работы.</summary>
    public MaintenanceType WorkType { get; set; }

    /// <summary>Дата выполнения работы.</summary>
    public DateTime Date { get; set; }

    /// <summary>Комментарий (результаты, замечания и т.п.).</summary>
    public string Comment { get; set; } = string.Empty;

    /// <summary>Кто выполнил обслуживание (ФИО, логин, табельный номер).</summary>
    public string PerformedBy { get; set; } = string.Empty;

    /// <summary>Позиция подшипника (только для смазки и замены подшипника).</summary>
    public BearingPosition? BearingPosition { get; set; }

    /// <summary>Идентификатор использованного типа смазки (только для смазки).</summary>
    public int? LubricantTypeId { get; set; }

    /// <summary>Идентификатор старого подшипника (только для замены подшипника).</summary>
    public int? OldBearingId { get; set; }

    /// <summary>Идентификатор нового подшипника (только для замены подшипника).</summary>
    public int? NewBearingId { get; set; }

    /// <summary>Навигационное свойство к двигателю.</summary>
    public virtual Motor Motor { get; set; } = null!;

    /// <summary>Навигационное свойство к типу смазки.</summary>
    public virtual LubricantType? LubricantType { get; set; }

    /// <summary>Навигационное свойство к старому подшипнику.</summary>
    public virtual Bearing? OldBearing { get; set; }

    /// <summary>Навигационное свойство к новому подшипнику.</summary>
    public virtual Bearing? NewBearing { get; set; }
}