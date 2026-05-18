using AssetTracker.Domain.Enums;

namespace AssetTracker.Application.DTOs;

public class CreateMotorDto
{
    public int InventoryNumber { get; set; }
    public string Type { get; set; } = string.Empty;
    public double ShaftDiameter { get; set; } // мм
    public double Power { get; set; }
    public int Speed { get; set; }
    public int? FrontBearingId { get; set; } // ID подшипника из справочника
    public int? RearBearingId { get; set; }
    public MotorStatus Status { get; set; } = MotorStatus.InOperation;
    public string InitialLocation { get; set; } = string.Empty;
    public MountingType MountingType { get; set; }
}

public class UpdateMotorDto
{
    public string Type { get; set; } = string.Empty;
    public double ShaftDiameter { get; set; } // мм
    public double Power { get; set; }
    public int Speed { get; set; }
    public int? FrontBearingId { get; set; }
    public int? RearBearingId { get; set; }
    public MotorStatus Status { get; set; }
    public MountingType MountingType { get; set; }
}

public class MoveMotorDto
{
    public string NewLocation { get; set; } = string.Empty;
    public MotorStatus? NewStatus { get; set; }
}