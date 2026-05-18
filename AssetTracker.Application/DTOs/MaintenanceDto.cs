using AssetTracker.Domain.Enums;

namespace AssetTracker.Application.DTOs;

public class MaintenanceDto
{
    public MaintenanceType WorkType { get; set; }
    public string Comment { get; set; } = string.Empty;

    // Поля для смазки
    public BearingPosition? BearingPosition { get; set; }
    public int? LubricantTypeId { get; set; }

    // Поля для замены подшипника – вместо строки NewBearingType передаём данные нового подшипника
    public CreateBearingDto? NewBearing { get; set; }
}

/// <summary>DTO для редактирования записи обслуживания</summary>
public class UpdateMaintenanceLogDto
{
    public string? Comment { get; set; }
    public int? LubricantTypeId { get; set; }

    // При замене подшипника можно обновить данные нового подшипника (опционально)
    public CreateBearingDto? NewBearing { get; set; }
}