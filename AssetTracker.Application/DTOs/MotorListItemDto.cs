namespace AssetTracker.Application.DTOs;

/// <summary>
/// Краткое DTO для списка двигателей.
/// </summary>
public class MotorListItemDto
{
    /// <summary>Суррогатный идентификатор.</summary>
    public int Id { get; set; }

    /// <summary>Инвентарный номер (может отсутствовать).</summary>
    public string? InventoryNumber { get; set; }

    /// <summary>Тип.</summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>Мощность.</summary>
    public double Power { get; set; }

    /// <summary>Статус (строка).</summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>Текущее местоположение.</summary>
    public string CurrentLocation { get; set; } = string.Empty;
}