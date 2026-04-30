using AssetTracker.Application.DTOs;
using AssetTracker.Application.Interfaces;
using AssetTracker.Domain.Entities;
using AssetTracker.Domain.Enums;
using AssetTracker.Domain.Interfaces;
using AutoMapper;
using Microsoft.Extensions.Logging;

namespace AssetTracker.Application.Services;

public class MotorService : IMotorService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<MotorService> _logger;

    public MotorService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<MotorService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<MotorListItemDto>> GetAllMotorsAsync()
    {
        _logger.LogInformation("Fetching all motors");
        var motors = await _unitOfWork.Motors.GetAllAsync();

        return motors.Select(m => new MotorListItemDto
        {
            InventoryNumber = m.InventoryNumber,
            Type = m.Type,
            Power = m.Power,
            Status = m.Status.ToString()
        });
    }

    public async Task<MotorFullHistoryDto> CreateMotorAsync(CreateMotorDto dto)
    {
        _logger.LogInformation("Creating new motor with inventory number {InventoryNumber}", dto.InventoryNumber);

        var existingMotor = await _unitOfWork.Motors.GetByIdAsync(dto.InventoryNumber);
        if (existingMotor != null)
            throw new InvalidOperationException($"Двигатель с инвентарным номером {dto.InventoryNumber} уже существует");

        var motor = _mapper.Map<Motor>(dto);
        motor.Status = dto.Status;

        await _unitOfWork.Motors.AddAsync(motor);
        await _unitOfWork.SaveChangesAsync();

        // Создаём первую запись о местоположении
        var location = new LocationHistory
        {
            MotorId = motor.InventoryNumber,
            Location = dto.InitialLocation,
            StartDate = DateTime.UtcNow,
            EndDate = null
        };
        await _unitOfWork.LocationHistories.AddAsync(location);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Motor {InventoryNumber} created successfully", motor.InventoryNumber);
        return await GetFullHistoryAsync(motor.InventoryNumber);
    }

    public async Task MoveMotorAsync(int motorId, MoveMotorDto dto)
    {
        _logger.LogInformation("Moving motor {MotorId} to {NewLocation}", motorId, dto.NewLocation);

        var motor = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с инвентарным номером {motorId} не найден");

        // Обновляем статус, если передан и отличается от текущего
        if (dto.NewStatus.HasValue && motor.Status != dto.NewStatus.Value)
        {
            _logger.LogInformation("Changing motor {MotorId} status from {OldStatus} to {NewStatus}",
                motorId, motor.Status, dto.NewStatus.Value);
            motor.Status = dto.NewStatus.Value;
            _unitOfWork.Motors.Update(motor);

            // Опционально: добавить запись в журнал обслуживания/ремонта о смене статуса
            // Это позволит видеть изменения статуса в истории.
            var statusChangeLog = new MaintenanceLog
            {
                MotorId = motorId,
                WorkType = MaintenanceType.Lubrication, // или добавить новый тип? можно закомментировать, если не нужно
                Date = DateTime.UtcNow,
                Comment = $"Изменение статуса: {dto.NewStatus.Value} (при перемещении в {dto.NewLocation})"
            };
            // Не добавляем принудительно, т.к. WorkType не соответствует. Лучше создать отдельный тип.
            // Для чистоты просто обновим статус, без дополнительной записи.
        }

        // Закрыть активную запись перемещения
        var activeLocation = await _unitOfWork.LocationHistories.GetActiveLocationAsync(motorId);
        if (activeLocation != null)
        {
            activeLocation.EndDate = DateTime.UtcNow;
            _unitOfWork.LocationHistories.Update(activeLocation);
        }

        // Создать новую запись
        var newLocation = new LocationHistory
        {
            MotorId = motorId,
            Location = dto.NewLocation,
            StartDate = DateTime.UtcNow,
            EndDate = null
        };
        await _unitOfWork.LocationHistories.AddAsync(newLocation);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Motor {MotorId} moved to {NewLocation}", motorId, dto.NewLocation);
    }

    public async Task AddMaintenanceAsync(int motorId, MaintenanceDto dto)
    {
        _logger.LogInformation("Adding maintenance for motor {MotorId}, type {WorkType}", motorId, dto.WorkType);

        var motor = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с инвентарным номером {motorId} не найден");

        var maintenance = new MaintenanceLog
        {
            MotorId = motorId,
            WorkType = dto.WorkType,
            Date = DateTime.UtcNow,
            Comment = dto.Comment
        };

        await _unitOfWork.MaintenanceLogs.AddAsync(maintenance);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Maintenance recorded for motor {MotorId}", motorId);
    }

    public async Task<MotorFullHistoryDto> GetFullHistoryAsync(int motorId)
    {
        _logger.LogInformation("Fetching full history for motor {MotorId}", motorId);

        var motor = await _unitOfWork.Motors.GetWithFullHistoryAsync(motorId);
        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с инвентарным номером {motorId} не найден");

        var dto = _mapper.Map<MotorFullHistoryDto>(motor);
        dto.LocationHistory = motor.LocationHistories
            .OrderBy(l => l.StartDate)
            .Select(l => new LocationHistoryDto
            {
                Id = l.Id,
                Location = l.Location,
                StartDate = l.StartDate,
                EndDate = l.EndDate
            }).ToList();

        dto.MaintenanceLogs = motor.MaintenanceLogs
            .OrderByDescending(m => m.Date)
            .Select(m => new MaintenanceLogDto
            {
                Id = m.Id,
                WorkType = m.WorkType.ToString(),
                Date = m.Date,
                Comment = m.Comment
            }).ToList();

        return dto;
    }
}