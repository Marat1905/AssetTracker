using AssetTracker.Domain.Enums;

namespace AssetTracker.Application.DTOs;

public class MotorFullHistoryDto
{
    public int InventoryNumber { get; set; }
    public string Type { get; set; } = string.Empty;
    public double ShaftDiameter { get; set; }
    public double Power { get; set; }
    public int Speed { get; set; }
    public int? FrontBearingId { get; set; }
    public int? RearBearingId { get; set; }
    public string? FrontBearingType { get; set; }   // для отображения типа подшипника (из связанной сущности)
    public string? RearBearingType { get; set; }
    public string? FrontBearingManufacturer { get; set; }
    public string? RearBearingManufacturer { get; set; }
    public string? FrontBearingSupplier { get; set; }
    public string? RearBearingSupplier { get; set; }
    public MotorStatus Status { get; set; }
    public MountingType MountingType { get; set; }

    public string? FrontBearingLastLubricant { get; set; }
    public string? RearBearingLastLubricant { get; set; }

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
    public string? BearingPosition { get; set; }
    public int? LubricantTypeId { get; set; }
    public string? LubricantTypeName { get; set; }
    public int? OldBearingId { get; set; }
    public string? OldBearingType { get; set; }
    public int? NewBearingId { get; set; }
    public string? NewBearingType { get; set; }
}

/// <summary>
/// DTO для редактирования записи истории перемещений (только изменение места расположения)
/// </summary>
public class UpdateLocationHistoryDto
{
    /// <summary>
    /// Новое место расположения
    /// </summary>
    public string Location { get; set; } = string.Empty;
}