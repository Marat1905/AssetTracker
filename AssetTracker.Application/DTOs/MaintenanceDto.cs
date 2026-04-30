using AssetTracker.Domain.Enums;

namespace AssetTracker.Application.DTOs
{
    public class MaintenanceDto
    {
        public MaintenanceType WorkType { get; set; }
        public string Comment { get; set; } = string.Empty;
    }
}
