using AssetTracker.Domain.Enums;

namespace AssetTracker.Domain.Entities;

public class Motor
{
    public int InventoryNumber { get; set; } // PK

    public string Type { get; set; } = string.Empty;

    /// <summary>Диаметр вала, мм</summary>
    public double ShaftDiameter { get; set; }

    public double Power { get; set; } // кВт
    public int Speed { get; set; } // об/мин

    // Заменяем строковые поля на внешние ключи к подшипникам
    public int FrontBearingId { get; set; }
    public int RearBearingId { get; set; }

    public MotorStatus Status { get; set; }

    /// <summary>Тип монтажа (лапы, лапы+фланец, фланец)</summary>
    public MountingType MountingType { get; set; }

    // Навигационные свойства
    public virtual Bearing FrontBearing { get; set; } = null!;
    public virtual Bearing RearBearing { get; set; } = null!;

    public virtual ICollection<LocationHistory> LocationHistories { get; set; } = new List<LocationHistory>();
    public virtual ICollection<MaintenanceLog> MaintenanceLogs { get; set; } = new List<MaintenanceLog>();
}