using System.ComponentModel.DataAnnotations;

namespace AssetTracker.Domain.Entities;

/// <summary>
/// Подшипник, используемый в электродвигателе
/// </summary>
public class Bearing
{
    public int Id { get; set; }

    /// <summary>Тип подшипника (например, 6204, 6305 и т.д.)</summary>
    [Required]
    [MaxLength(100)]
    public string Type { get; set; } = string.Empty;

    /// <summary>Производитель подшипника</summary>
    [Required]
    [MaxLength(100)]
    public string Manufacturer { get; set; } = string.Empty;

    /// <summary>Поставщик подшипника</summary>
    [Required]
    [MaxLength(100)]
    public string Supplier { get; set; } = string.Empty;

    // Навигационные свойства для двигателей (передний и задний подшипник)
    public virtual Motor? FrontMotor { get; set; }
    public virtual Motor? RearMotor { get; set; }
}