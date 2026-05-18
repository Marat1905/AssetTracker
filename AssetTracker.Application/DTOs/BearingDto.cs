namespace AssetTracker.Application.DTOs;

/// <summary>DTO для вывода информации о подшипнике</summary>
public class BearingDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Manufacturer { get; set; } = string.Empty;
    public string Supplier { get; set; } = string.Empty;
}

/// <summary>DTO для создания подшипника (используется внутри при создании двигателя или замене)</summary>
public class CreateBearingDto
{
    public string Type { get; set; } = string.Empty;
    public string Manufacturer { get; set; } = string.Empty;
    public string Supplier { get; set; } = string.Empty;
}

/// <summary>Информация о подшипнике для использования в CreateMotorDto и UpdateMotorDto</summary>
public class BearingInfoDto
{
    public string Type { get; set; } = string.Empty;
    public string Manufacturer { get; set; } = string.Empty;
    public string Supplier { get; set; } = string.Empty;
}