using AssetTracker.Domain.Enums;

namespace AssetTracker.Application.DTOs;

public class CreateMotorDto
{
    public int InventoryNumber { get; set; }
    public string Type { get; set; } = string.Empty;
    public double ShaftDiameter { get; set; } // мм
    public double Power { get; set; }
    public int Speed { get; set; }
    public string FrontBearingType { get; set; } = string.Empty;
    public string RearBearingType { get; set; } = string.Empty;
    public MotorStatus Status { get; set; } = MotorStatus.InOperation;
    public string InitialLocation { get; set; } = string.Empty;
}

public class UpdateMotorDto
{
    public string Type { get; set; } = string.Empty;
    public double ShaftDiameter { get; set; } // мм
    public double Power { get; set; }
    public int Speed { get; set; }
    public string FrontBearingType { get; set; } = string.Empty;
    public string RearBearingType { get; set; } = string.Empty;
    public MotorStatus Status { get; set; }
}

public class MoveMotorDto
{
    public string NewLocation { get; set; } = string.Empty;
    public MotorStatus? NewStatus { get; set; }
}