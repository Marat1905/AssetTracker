using AssetTracker.Domain.Enums;

namespace AssetTracker.Application.DTOs;

public class MaintenanceDto
{
    public MaintenanceType WorkType { get; set; }
    public string Comment { get; set; } = string.Empty;

    // Поля для смазки
    public BearingPosition? BearingPosition { get; set; }
    public int? LubricantTypeId { get; set; }

    // Поле для замены подшипника (теперь ID нового подшипника)
    public int? NewBearingId { get; set; }
}

public class UpdateMaintenanceLogDto
{
    public string? Comment { get; set; }
    public int? LubricantTypeId { get; set; }
    public int? NewBearingId { get; set; } // ID нового подшипника
}