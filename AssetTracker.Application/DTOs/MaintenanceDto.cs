using AssetTracker.Domain.Enums;

namespace AssetTracker.Application.DTOs;

/// <summary>
/// DTO для добавления записи обслуживания.
/// </summary>
public class MaintenanceDto
{
    /// <summary>Тип выполненной работы.</summary>
    public MaintenanceType WorkType { get; set; }

    /// <summary>Комментарий.</summary>
    public string Comment { get; set; } = string.Empty;

    /// <summary>Кто выполнил обслуживание (обязательное поле).</summary>
    public string PerformedBy { get; set; } = string.Empty;

    /// <summary>Позиция подшипника (для смазки и замены).</summary>
    public BearingPosition? BearingPosition { get; set; }

    /// <summary>Идентификатор типа смазки (для смазки).</summary>
    public int? LubricantTypeId { get; set; }

    /// <summary>Идентификатор существующего подшипника (для замены).</summary>
    public int? ExistingBearingId { get; set; }

    /// <summary>Данные нового подшипника (для замены).</summary>
    public CreateBearingDto? NewBearing { get; set; }
}

/// <summary>
/// DTO для редактирования записи обслуживания.
/// </summary>
public class UpdateMaintenanceLogDto
{
    /// <summary>Новый комментарий (опционально).</summary>
    public string? Comment { get; set; }

    /// <summary>Новый исполнитель (опционально).</summary>
    public string? PerformedBy { get; set; }

    /// <summary>Новый тип смазки (только для смазки).</summary>
    public int? LubricantTypeId { get; set; }

    /// <summary>Существующий подшипник (для замены).</summary>
    public int? ExistingBearingId { get; set; }

    /// <summary>Новый подшипник (для замены).</summary>
    public CreateBearingDto? NewBearing { get; set; }
}