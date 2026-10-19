using AssetTracker.Domain.Enums;

namespace AssetTracker.Domain.Entities;

/// <summary>
/// Электродвигатель – основная сущность системы.
/// </summary>
public class Motor
{
    /// <summary>Суррогатный первичный ключ (автоинкремент).</summary>
    public int Id { get; set; }

    /// <summary>Инвентарный номер (необязательный, но уникальный, если задан).</summary>
    public string? InventoryNumber { get; set; }

    /// <summary>Тип двигателя (марка, модель).</summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>Диаметр вала (мм). Необязательное поле.</summary>
    public double? ShaftDiameter { get; set; }

    /// <summary>Мощность (кВт).</summary>
    public double Power { get; set; }

    /// <summary>Обороты (об/мин).</summary>
    public int Speed { get; set; }

    /// <summary>Идентификатор переднего подшипника (внешний ключ). Необязательно.</summary>
    public int? FrontBearingId { get; set; }

    /// <summary>Идентификатор заднего подшипника (внешний ключ). Необязательно.</summary>
    public int? RearBearingId { get; set; }

    /// <summary>Навигационное свойство: передний подшипник (может отсутствовать).</summary>
    public virtual Bearing? FrontBearing { get; set; }

    /// <summary>Навигационное свойство: задний подшипник (может отсутствовать).</summary>
    public virtual Bearing? RearBearing { get; set; }

    /// <summary>Текущий статус двигателя.</summary>
    public MotorStatus Status { get; set; }

    /// <summary>Тип монтажа (лапы, лапы+фланец, фланец и т.д.).</summary>
    public MountingType MountingType { get; set; }

    /// <summary>Коллекция записей истории перемещений.</summary>
    public virtual ICollection<LocationHistory> LocationHistories { get; set; } = new List<LocationHistory>();

    /// <summary>Коллекция записей журнала обслуживания.</summary>
    public virtual ICollection<MaintenanceLog> MaintenanceLogs { get; set; } = new List<MaintenanceLog>();
}