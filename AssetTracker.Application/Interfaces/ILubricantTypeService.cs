using AssetTracker.Application.DTOs;

namespace AssetTracker.Application.Interfaces;

public interface ILubricantTypeService
{
    Task<IEnumerable<LubricantTypeDto>> GetAllAsync();
    Task<LubricantTypeDto?> GetByIdAsync(int id);
    Task<LubricantTypeDto> CreateAsync(CreateLubricantTypeDto dto);
    Task<LubricantTypeDto> UpdateAsync(int id, UpdateLubricantTypeDto dto);
    Task DeleteAsync(int id);
}