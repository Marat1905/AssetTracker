namespace AssetTracker.Application.DTOs;

/// <summary>
/// DTO для чтения информации о подшипнике
/// </summary>
public class BearingDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Manufacturer { get; set; } = string.Empty;
    public string Supplier { get; set; } = string.Empty;
}
/// <summary>
/// DTO для создания нового подшипника (обязательны тип, производитель и поставщик)
/// </summary>
public class CreateBearingDto
{
    public string Type { get; set; } = string.Empty;
    public string Manufacturer { get; set; } = string.Empty;
    public string Supplier { get; set; } = string.Empty;
}

/// <summary>
/// DTO для обновления существующего подшипника (все поля обязательны)
/// </summary>
public class UpdateBearingDto
{
    public string Type { get; set; } = string.Empty;
    public string Manufacturer { get; set; } = string.Empty;
    public string Supplier { get; set; } = string.Empty;
}