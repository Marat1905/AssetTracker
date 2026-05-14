using AssetTracker.Domain.Enums;

namespace AssetTracker.Domain.Entities;

public class MaintenanceLog
{
    public int Id { get; set; }
    public int MotorId { get; set; }
    public MaintenanceType WorkType { get; set; }
    public DateTime Date { get; set; }
    public string Comment { get; set; } = string.Empty;

    /// <summary>Позиция подшипника</summary>
    public BearingPosition? BearingPosition { get; set; }
    public int? LubricantTypeId { get; set; }

    // Навигационные свойства
    public virtual Motor Motor { get; set; } = null!;
    public virtual LubricantType? LubricantType { get; set; }
}