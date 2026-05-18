using AssetTracker.Application.DTOs;

namespace AssetTracker.Application.Interfaces;

public interface IBearingService
{
    Task<IEnumerable<BearingDto>> GetAllAsync();
    Task<BearingDto?> GetByIdAsync(int id);
    Task<BearingDto> CreateAsync(CreateBearingDto dto);
    Task<BearingDto> UpdateAsync(int id, UpdateBearingDto dto);
    Task DeleteAsync(int id);
}