using AssetTracker.Application.DTOs;
using AssetTracker.Application.Interfaces;
using AssetTracker.Domain.Entities;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AssetTracker.Application.Services;

/// <summary>
/// Сервис для работы с типами смазки.
/// </summary>
public class LubricantTypeService : ILubricantTypeService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<LubricantTypeService> _logger;

    public LubricantTypeService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<LubricantTypeService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<IEnumerable<LubricantTypeDto>> GetAllAsync()
    {
        _logger.LogInformation("Fetching all lubricant types");
        var types = await _unitOfWork.LubricantTypes.GetAllAsync();
        return _mapper.Map<IEnumerable<LubricantTypeDto>>(types);
    }

    /// <inheritdoc />
    public async Task<LubricantTypeDto?> GetByIdAsync(int id)
    {
        _logger.LogInformation("Fetching lubricant type with id {Id}", id);
        var type = await _unitOfWork.LubricantTypes.GetByIdAsync(id);
        return type == null ? null : _mapper.Map<LubricantTypeDto>(type);
    }

    /// <inheritdoc />
    public async Task<LubricantTypeDto> CreateAsync(CreateLubricantTypeDto dto)
    {
        _logger.LogInformation("Creating new lubricant type: {Name}", dto.Name);
        var entity = _mapper.Map<LubricantType>(dto);
        await _unitOfWork.LubricantTypes.AddAsync(entity);
        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Lubricant type created with id {Id}", entity.Id);
        return _mapper.Map<LubricantTypeDto>(entity);
    }

    /// <inheritdoc />
    public async Task<LubricantTypeDto> UpdateAsync(int id, UpdateLubricantTypeDto dto)
    {
        _logger.LogInformation("Updating lubricant type {Id}", id);
        var existing = await _unitOfWork.LubricantTypes.GetByIdAsync(id);
        if (existing == null)
            throw new KeyNotFoundException($"Тип смазки с id {id} не найден");

        _mapper.Map(dto, existing);
        _unitOfWork.LubricantTypes.Update(existing);
        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Lubricant type {Id} updated", id);
        return _mapper.Map<LubricantTypeDto>(existing);
    }

    /// <inheritdoc />
    public async Task DeleteAsync(int id)
    {
        _logger.LogInformation("Deleting lubricant type {Id}", id);
        var existing = await _unitOfWork.LubricantTypes.GetByIdAsync(id);
        if (existing == null)
            throw new KeyNotFoundException($"Тип смазки с id {id} не найден");

        var isUsed = await _unitOfWork.MaintenanceLogs.GetQueryable()
            .AnyAsync(m => m.LubricantTypeId == id);
        if (isUsed)
            throw new InvalidOperationException("Невозможно удалить тип смазки, так как он используется в журнале обслуживания");

        _unitOfWork.LubricantTypes.Remove(existing);
        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Lubricant type {Id} deleted", id);
    }
}