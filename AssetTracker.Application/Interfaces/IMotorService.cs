using AssetTracker.Application.DTOs;
using AssetTracker.Domain.Enums;

namespace AssetTracker.Application.Interfaces;

public interface IMotorService
{
    Task<MotorFullHistoryDto> CreateMotorAsync(CreateMotorDto dto);
    Task MoveMotorAsync(int motorId, MoveMotorDto dto);
    Task AddMaintenanceAsync(int motorId, MaintenanceDto dto);
    Task<MotorFullHistoryDto> GetFullHistoryAsync(int motorId);
    Task<IEnumerable<MotorListItemDto>> GetAllMotorsAsync();
    Task UpdateMotorAsync(int motorId, UpdateMotorDto dto);
    Task DeleteMotorAsync(int motorId);

    // Пагинация и фильтрация
    Task<PagedResult<MotorListItemDto>> GetMotorsPagedAsync(int page, int pageSize, string? inventoryNumberFilter, string? locationFilter, MotorStatus? statusFilter);
    Task<PagedResult<LocationHistoryDto>> GetMotorLocationHistoryPagedAsync(int motorId, int page, int pageSize);
    Task<PagedResult<MaintenanceLogDto>> GetMotorMaintenanceLogsPagedAsync(int motorId, int page, int pageSize);

    /// <summary>
    /// Редактирование записи обслуживания (разрешены только Comment и для смазки – LubricantTypeId)
    /// </summary>
    Task UpdateMaintenanceLogAsync(int motorId, int logId, UpdateMaintenanceLogDto dto);

    /// <summary>
    /// Удаление записи обслуживания
    /// </summary>
    Task DeleteMaintenanceLogAsync(int motorId, int logId);
}