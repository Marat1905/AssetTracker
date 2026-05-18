using System.ComponentModel.DataAnnotations;

namespace AssetTracker.Domain.Entities;

/// <summary>
/// Тип смазки, используемый при обслуживании подшипников
/// </summary>
public class LubricantType
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}