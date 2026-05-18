using AssetTracker.Domain.Enums;

namespace AssetTracker.Domain.Entities;

public class MaintenanceLog
{
    public int Id { get; set; }
    public int MotorId { get; set; }
    public MaintenanceType WorkType { get; set; }
    public DateTime Date { get; set; }
    public string Comment { get; set; } = string.Empty;

    public BearingPosition? BearingPosition { get; set; }
    public int? LubricantTypeId { get; set; }

    // Заменяем строковые поля на идентификаторы подшипников
    public int? OldBearingId { get; set; }
    public int? NewBearingId { get; set; }

    // Навигационные свойства
    public virtual Motor Motor { get; set; } = null!;
    public virtual LubricantType? LubricantType { get; set; }
    public virtual Bearing? OldBearing { get; set; }
    public virtual Bearing? NewBearing { get; set; }
}