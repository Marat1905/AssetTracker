using System.ComponentModel.DataAnnotations;

namespace AssetTracker.Domain.Entities;

/// <summary>
/// Подшипник, используемый в электродвигателе.
/// </summary>
public class Bearing
{
    /// <summary>Уникальный идентификатор подшипника.</summary>
    public int Id { get; set; }

    /// <summary>Тип подшипника (например, 6304, 6205 и т.д.).</summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>Производитель подшипника.</summary>
    public string Manufacturer { get; set; } = string.Empty;

    /// <summary>Поставщик подшипника.</summary>
    public string Supplier { get; set; } = string.Empty;
}