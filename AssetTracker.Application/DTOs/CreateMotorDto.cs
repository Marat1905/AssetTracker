using AssetTracker.Domain.Enums;

namespace AssetTracker.Application.DTOs;

public class CreateMotorDto
{
    public int InventoryNumber { get; set; }
    public string Type { get; set; } = string.Empty;
    public double ShaftDiameter { get; set; } // мм
    public double Power { get; set; }
    public int Speed { get; set; }

    // Вместо строк FrontBearingType/RearBearingType используем вложенные DTO для создания подшипников
    public CreateBearingDto FrontBearing { get; set; } = new CreateBearingDto();
    public CreateBearingDto RearBearing { get; set; } = new CreateBearingDto();

    public MotorStatus Status { get; set; } = MotorStatus.InOperation;
    public string InitialLocation { get; set; } = string.Empty;
    /// <summary>Тип монтажа (лапы, лапы и фланец, фланец)</summary>
    public MountingType MountingType { get; set; }
}

public class UpdateMotorDto
{
    public string Type { get; set; } = string.Empty;
    public double ShaftDiameter { get; set; } // мм
    public double Power { get; set; }
    public int Speed { get; set; }
    public MotorStatus Status { get; set; }
    /// <summary>Тип монтажа (лапы, лапы и фланец, фланец)</summary>
    public MountingType MountingType { get; set; }
}

public class MoveMotorDto
{
    public string NewLocation { get; set; } = string.Empty;
    public MotorStatus? NewStatus { get; set; }
}