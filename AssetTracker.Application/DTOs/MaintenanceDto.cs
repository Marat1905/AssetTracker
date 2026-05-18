using AssetTracker.Domain.Enums;

namespace AssetTracker.Application.DTOs;

public class MaintenanceDto
{
    public MaintenanceType WorkType { get; set; }
    public string Comment { get; set; } = string.Empty;

    // Поля для смазки (обязательны, если WorkType == Lubrication)
    public BearingPosition? BearingPosition { get; set; }
    public int? LubricantTypeId { get; set; }

    // Поле для замены подшипника (обязательно, если WorkType == BearingReplacement)
    public string? NewBearingType { get; set; }
}

/// <summary>
/// DTO для редактирования записи обслуживания
/// </summary>
public class UpdateMaintenanceLogDto
{
    /// <summary>
    /// Новый комментарий (опционально)
    /// </summary>
    public string? Comment { get; set; }

    /// <summary>
    /// Новый тип смазки (только для операций смазки, опционально)
    /// </summary>
    public int? LubricantTypeId { get; set; }

    /// <summary>
    /// Новый тип подшипника (только для операций замены подшипника, опционально)
    /// </summary>
    public string? NewBearingType { get; set; }
}