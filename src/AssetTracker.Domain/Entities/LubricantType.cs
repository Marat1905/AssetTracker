using System.ComponentModel.DataAnnotations;

namespace AssetTracker.Domain.Entities;

/// <summary>
/// Тип смазки, используемый при обслуживании подшипников.
/// </summary>
public class LubricantType
{
    /// <summary>Уникальный идентификатор типа смазки.</summary>
    public int Id { get; set; }

    /// <summary>Название типа смазки.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Описание/примечание.</summary>
    public string? Description { get; set; }
}