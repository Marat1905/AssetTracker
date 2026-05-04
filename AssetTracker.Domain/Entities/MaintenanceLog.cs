using AssetTracker.Domain.Enums;

namespace AssetTracker.Domain.Entities;
public class MaintenanceLog
{
    public int Id { get; set; }
    public int MotorId { get; set; }
    public MaintenanceType WorkType { get; set; }
    public DateTime Date { get; set; }
    public string Comment { get; set; } = string.Empty;

    public virtual Motor Motor { get; set; } = null!;
}
