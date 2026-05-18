namespace AssetTracker.Application.DTOs;
public class MotorListItemDto
{
    public int InventoryNumber { get; set; }
    public string Type { get; set; } = string.Empty;
    public double Power { get; set; }
    public string Status { get; set; } = string.Empty;
    public string CurrentLocation { get; set; } = string.Empty;
    public string? FrontBearingType { get; set; }  // для краткого отображения
    public string? RearBearingType { get; set; }
}
