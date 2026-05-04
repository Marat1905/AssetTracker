using AssetTracker.Domain.Enums;

namespace AssetTracker.Application.DTOs;
public class UpdateMotorDto
{
    public string Type { get; set; } = string.Empty;
    public string Dimensions { get; set; } = string.Empty;
    public double Power { get; set; }
    public int Speed { get; set; }
    public string FrontBearingType { get; set; } = string.Empty;
    public string RearBearingType { get; set; } = string.Empty;
    public MotorStatus Status { get; set; }
}

