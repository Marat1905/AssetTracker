using AssetTracker.Domain.Enums;

namespace AssetTracker.Application.DTOs;
public class MoveMotorDto
{
    public string NewLocation { get; set; } = string.Empty;
    public MotorStatus? NewStatus { get; set; }
}
