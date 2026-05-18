namespace AssetTracker.Application.DTOs;

/// <summary>
/// Информация о подшипнике
/// </summary>
public class BearingDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Manufacturer { get; set; }
    public string? Supplier { get; set; }
}

/// <summary>
/// DTO для создания подшипника (используется при создании мотора или замене)
/// </summary>
public class CreateBearingDto
{
    public string Type { get; set; } = string.Empty;
    public string? Manufacturer { get; set; }
    public string? Supplier { get; set; }
}

/// <summary>
/// DTO для обновления подшипника
/// </summary>
public class UpdateBearingDto
{
    public string Type { get; set; } = string.Empty;
    public string? Manufacturer { get; set; }
    public string? Supplier { get; set; }
}