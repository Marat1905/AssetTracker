using AssetTracker.Domain.Enums;

namespace AssetTracker.Domain.Entities;
public class Motor
{
    public int InventoryNumber { get; set; } // PK
    public string Type { get; set; } = string.Empty;
    public string Dimensions { get; set; } = string.Empty;
    public double Power { get; set; } // кВт, >0
    public int Speed { get; set; } // об/мин
    public string FrontBearingType { get; set; } = string.Empty;
    public string RearBearingType { get; set; } = string.Empty;
    public MotorStatus Status { get; set; }

    // Navigation properties
    public virtual ICollection<LocationHistory> LocationHistories { get; set; } = new List<LocationHistory>();
    public virtual ICollection<MaintenanceLog> MaintenanceLogs { get; set; } = new List<MaintenanceLog>();
}
