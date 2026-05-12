using AssetTracker.Domain.Enums;

namespace AssetTracker.Application.DTOs;

public class MotorFullHistoryDto
{
    public int InventoryNumber { get; set; }
    public string Type { get; set; } = string.Empty;
    public double ShaftDiameter { get; set; } // мм
    public double Power { get; set; }
    public int Speed { get; set; }
    public string FrontBearingType { get; set; } = string.Empty;
    public string RearBearingType { get; set; } = string.Empty;
    public MotorStatus Status { get; set; }

    /// <summary>Тип монтажа (лапы, лапы и фланец, фланец)</summary>
    public MountingType MountingType { get; set; }

    public List<LocationHistoryDto> LocationHistory { get; set; } = new();
    public List<MaintenanceLogDto> MaintenanceLogs { get; set; } = new();
}

public class LocationHistoryDto
{
    public int Id { get; set; }
    public string Location { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class MaintenanceLogDto
{
    public int Id { get; set; }
    public string WorkType { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Comment { get; set; } = string.Empty;
}