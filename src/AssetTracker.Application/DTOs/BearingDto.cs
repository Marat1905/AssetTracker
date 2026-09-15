namespace AssetTracker.Application.DTOs;

/// <summary>
/// DTO для чтения информации о подшипнике.
/// </summary>
public class BearingDto
{
    /// <summary>Идентификатор подшипника.</summary>
    public int Id { get; set; }

    /// <summary>Тип подшипника (например, 6304).</summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>Производитель.</summary>
    public string Manufacturer { get; set; } = string.Empty;

    /// <summary>Поставщик.</summary>
    public string Supplier { get; set; } = string.Empty;
}

/// <summary>
/// DTO для создания нового подшипника.
/// </summary>
public class CreateBearingDto
{
    /// <summary>Тип подшипника.</summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>Производитель.</summary>
    public string Manufacturer { get; set; } = string.Empty;

    /// <summary>Поставщик.</summary>
    public string Supplier { get; set; } = string.Empty;
}

/// <summary>
/// DTO для обновления существующего подшипника.
/// </summary>
public class UpdateBearingDto
{
    /// <summary>Тип подшипника.</summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>Производитель.</summary>
    public string Manufacturer { get; set; } = string.Empty;

    /// <summary>Поставщик.</summary>
    public string Supplier { get; set; } = string.Empty;
}