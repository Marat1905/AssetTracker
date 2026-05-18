namespace AssetTracker.Application.DTOs;

/// <summary>
/// DTO для чтения информации о подшипнике
/// </summary>
public class BearingDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Manufacturer { get; set; }
    public string? Supplier { get; set; }
}

/// <summary>
/// DTO для создания нового подшипника
/// </summary>
public class CreateBearingDto
{
    public string Type { get; set; } = string.Empty;
    public string? Manufacturer { get; set; }
    public string? Supplier { get; set; }
}

/// <summary>
/// DTO для обновления существующего подшипника
/// </summary>
public class UpdateBearingDto
{
    public string Type { get; set; } = string.Empty;
    public string? Manufacturer { get; set; }
    public string? Supplier { get; set; }
}