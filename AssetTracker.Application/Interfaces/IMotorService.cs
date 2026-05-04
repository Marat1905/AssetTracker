using AssetTracker.Application.DTOs;

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
}