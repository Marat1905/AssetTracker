using AssetTracker.Domain.Enums;

namespace AssetTracker.Application.DTOs;

public class MotorFullHistoryDto
{
    public int InventoryNumber { get; set; }
    public string Type { get; set; } = string.Empty;
    public double ShaftDiameter { get; set; }
    public double Power { get; set; }
    public int Speed { get; set; }

    public BearingDto FrontBearing { get; set; } = new BearingDto();
    public BearingDto RearBearing { get; set; } = new BearingDto();

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
    /// <summary>Статус двигателя на момент нахождения на этом месте</summary>
    public string Status { get; set; } = string.Empty;
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

    public BearingDto? OldBearing { get; set; }
    public BearingDto? NewBearing { get; set; }
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