using AssetTracker.Domain.Enums;

namespace AssetTracker.Application.DTOs;

public class MaintenanceDto
{
    public MaintenanceType WorkType { get; set; }
    public string Comment { get; set; } = string.Empty;

    /// <summary>Кто выполнил обслуживание (обязательное поле)</summary>
    public string PerformedBy { get; set; } = string.Empty;

    // Поля для смазки (обязательны, если WorkType == Lubrication)
    public BearingPosition? BearingPosition { get; set; }
    public int? LubricantTypeId { get; set; }

    // Поля для замены подшипника (обязательны, если WorkType == BearingReplacement)
    public int? ExistingBearingId { get; set; }
    public CreateBearingDto? NewBearing { get; set; }
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
    /// Кто выполнил обслуживание (опционально, можно изменить)
    /// </summary>
    public string? PerformedBy { get; set; }

    /// <summary>
    /// Новый тип смазки (только для операций смазки, опционально)
    /// </summary>
    public int? LubricantTypeId { get; set; }

    /// <summary>
    /// Для замены подшипника: можно изменить подшипник на другой существующий
    /// </summary>
    public int? ExistingBearingId { get; set; }

    /// <summary>
    /// Для замены подшипника: можно создать новый подшипник (если ExistingBearingId не указан)
    /// </summary>
    public CreateBearingDto? NewBearing { get; set; }
}