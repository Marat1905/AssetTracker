using System.ComponentModel.DataAnnotations;

namespace AssetTracker.Domain.Entities;

/// <summary>
/// Подшипник, используемый в электродвигателях.
/// Содержит тип, производителя и поставщика.
/// </summary>
public class Bearing
{
    [Key]
    public int Id { get; set; }

    /// <summary>Тип подшипника (например, 6204, 6305)</summary>
    [Required]
    [MaxLength(100)]
    public string Type { get; set; } = string.Empty;

    /// <summary>Производитель подшипника</summary>
    [MaxLength(200)]
    public string? Manufacturer { get; set; }

    /// <summary>Поставщик подшипника</summary>
    [MaxLength(200)]
    public string? Supplier { get; set; }

    // Навигационные свойства
    public virtual ICollection<Motor> FrontMotors { get; set; } = new List<Motor>(); // двигатели, где этот подшипник - передний
    public virtual ICollection<Motor> RearMotors { get; set; } = new List<Motor>();  // двигатели, где этот подшипник - задний
    public virtual ICollection<MaintenanceLog> OldMaintenanceLogs { get; set; } = new List<MaintenanceLog>(); // замены, где был старый подшипник
    public virtual ICollection<MaintenanceLog> NewMaintenanceLogs { get; set; } = new List<MaintenanceLog>(); // замены, где установлен новый подшипник
}