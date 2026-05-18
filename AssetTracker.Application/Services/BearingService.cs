using AssetTracker.Application.DTOs;
using AssetTracker.Application.Interfaces;
using AssetTracker.Domain.Entities;
using AssetTracker.Domain.Interfaces;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AssetTracker.Application.Services;

public class BearingService : IBearingService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<BearingService> _logger;

    public BearingService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<BearingService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<BearingDto>> GetAllAsync()
    {
        _logger.LogInformation("Fetching all bearings");
        var bearings = await _unitOfWork.Bearings.GetAllAsync();
        return _mapper.Map<IEnumerable<BearingDto>>(bearings);
    }

    public async Task<BearingDto?> GetByIdAsync(int id)
    {
        _logger.LogInformation("Fetching bearing with id {Id}", id);
        var bearing = await _unitOfWork.Bearings.GetByIdAsync(id);
        return bearing == null ? null : _mapper.Map<BearingDto>(bearing);
    }

    public async Task<BearingDto> CreateAsync(CreateBearingDto dto)
    {
        _logger.LogInformation("Creating new bearing: {Type}", dto.Type);
        var entity = _mapper.Map<Bearing>(dto);
        await _unitOfWork.Bearings.AddAsync(entity);
        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Bearing created with id {Id}", entity.Id);
        return _mapper.Map<BearingDto>(entity);
    }

    public async Task<BearingDto> UpdateAsync(int id, UpdateBearingDto dto)
    {
        _logger.LogInformation("Updating bearing {Id}", id);
        var existing = await _unitOfWork.Bearings.GetByIdAsync(id);
        if (existing == null)
            throw new KeyNotFoundException($"Подшипник с id {id} не найден");

        _mapper.Map(dto, existing);
        _unitOfWork.Bearings.Update(existing);
        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Bearing {Id} updated", id);
        return _mapper.Map<BearingDto>(existing);
    }

    public async Task DeleteAsync(int id)
    {
        _logger.LogInformation("Deleting bearing {Id}", id);
        var existing = await _unitOfWork.Bearings.GetByIdAsync(id);
        if (existing == null)
            throw new KeyNotFoundException($"Подшипник с id {id} не найден");

        // Проверка, используется ли подшипник в двигателях или журнале обслуживания
        var isUsedInMotors = await _unitOfWork.Motors.GetQueryable()
            .AnyAsync(m => m.FrontBearingId == id || m.RearBearingId == id);
        var isUsedInMaintenance = await _unitOfWork.MaintenanceLogs.GetQueryable()
            .AnyAsync(m => m.OldBearingId == id || m.NewBearingId == id);

        if (isUsedInMotors || isUsedInMaintenance)
            throw new InvalidOperationException("Невозможно удалить подшипник, так как он используется в двигателях или истории обслуживания");

        _unitOfWork.Bearings.Remove(existing);
        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Bearing {Id} deleted", id);
    }
}