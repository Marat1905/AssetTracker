using AssetTracker.Application.DTOs;
using AssetTracker.Application.Interfaces;
using AssetTracker.Domain.Entities;
using AssetTracker.Domain.Enums;
using AssetTracker.Domain.Interfaces;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
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
            Status = m.Status.ToString(),
            CurrentLocation = string.Empty // будет заполнено ниже отдельным запросом, но для простоты оставим
        });
    }

    public async Task<MotorFullHistoryDto> CreateMotorAsync(CreateMotorDto dto)
    {
        _logger.LogInformation("Creating new motor with inventory number {InventoryNumber}", dto.InventoryNumber);

        var existingMotor = await _unitOfWork.Motors.GetByIdAsync(dto.InventoryNumber);
        if (existingMotor != null)
            throw new InvalidOperationException($"Двигатель с инвентарным номером {dto.InventoryNumber} уже существует");

        // Создаём подшипники
        var frontBearing = _mapper.Map<Bearing>(dto.FrontBearing);
        var rearBearing = _mapper.Map<Bearing>(dto.RearBearing);

        await _unitOfWork.Bearings.AddAsync(frontBearing);
        await _unitOfWork.Bearings.AddAsync(rearBearing);
        await _unitOfWork.SaveChangesAsync(); // чтобы получить Id

        var motor = _mapper.Map<Motor>(dto);
        motor.FrontBearingId = frontBearing.Id;
        motor.RearBearingId = rearBearing.Id;
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

        if (dto.NewStatus.HasValue && motor.Status != dto.NewStatus.Value)
        {
            _logger.LogInformation("Changing motor {MotorId} status from {OldStatus} to {NewStatus}",
                motorId, motor.Status, dto.NewStatus.Value);
            motor.Status = dto.NewStatus.Value;
            _unitOfWork.Motors.Update(motor);
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

        Bearing? newBearing = null;
        int? oldBearingId = null;

        // Замена подшипника
        if (dto.WorkType == MaintenanceType.BearingReplacement)
        {
            if (!dto.BearingPosition.HasValue)
                throw new ArgumentException("Для замены подшипника необходимо указать позицию (передний/задний)");
            if (dto.NewBearing == null)
                throw new ArgumentException("Для замены подшипника необходимо указать данные нового подшипника");

            // Получаем старый подшипник
            Bearing? oldBearing = dto.BearingPosition == BearingPosition.Front
                ? await _unitOfWork.Bearings.GetByIdAsync(motor.FrontBearingId)
                : await _unitOfWork.Bearings.GetByIdAsync(motor.RearBearingId);

            if (oldBearing == null)
                throw new InvalidOperationException("Старый подшипник не найден");

            oldBearingId = oldBearing.Id;

            // Создаём новый подшипник
            newBearing = _mapper.Map<Bearing>(dto.NewBearing);
            await _unitOfWork.Bearings.AddAsync(newBearing);
            await _unitOfWork.SaveChangesAsync(); // получаем Id

            // Обновляем двигатель
            if (dto.BearingPosition == BearingPosition.Front)
                motor.FrontBearingId = newBearing.Id;
            else
                motor.RearBearingId = newBearing.Id;

            _unitOfWork.Motors.Update(motor);
        }
        else if (dto.WorkType == MaintenanceType.Lubrication)
        {
            if (!dto.BearingPosition.HasValue)
                throw new ArgumentException("Для смазки необходимо указать позицию подшипника");
            if (!dto.LubricantTypeId.HasValue)
                throw new ArgumentException("Для смазки необходимо указать тип смазки");

            var lubricantExists = await _unitOfWork.LubricantTypes.ExistsAsync(dto.LubricantTypeId.Value);
            if (!lubricantExists)
                throw new ArgumentException($"Тип смазки с id {dto.LubricantTypeId} не существует");
        }

        var maintenance = new MaintenanceLog
        {
            MotorId = motorId,
            WorkType = dto.WorkType,
            Date = DateTime.UtcNow,
            Comment = dto.Comment,
            BearingPosition = dto.BearingPosition,
            LubricantTypeId = dto.LubricantTypeId,
            OldBearingId = oldBearingId,
            NewBearingId = newBearing?.Id
        };

        await _unitOfWork.MaintenanceLogs.AddAsync(maintenance);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Maintenance recorded for motor {MotorId}", motorId);
    }

    public async Task<MotorFullHistoryDto> GetFullHistoryAsync(int motorId)
    {
        _logger.LogInformation("Fetching full history for motor {MotorId}", motorId);

        var motor = await _unitOfWork.Motors.GetQueryable()
            .Include(m => m.FrontBearing)
            .Include(m => m.RearBearing)
            .FirstOrDefaultAsync(m => m.InventoryNumber == motorId);

        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с инвентарным номером {motorId} не найден");

        var dto = _mapper.Map<MotorFullHistoryDto>(motor);
        dto.FrontBearing = _mapper.Map<BearingDto>(motor.FrontBearing);
        dto.RearBearing = _mapper.Map<BearingDto>(motor.RearBearing);

        // История перемещений
        dto.LocationHistory = await _unitOfWork.LocationHistories.GetQueryable()
            .Where(l => l.MotorId == motorId)
            .OrderBy(l => l.StartDate)
            .Select(l => new LocationHistoryDto
            {
                Id = l.Id,
                Location = l.Location,
                StartDate = l.StartDate,
                EndDate = l.EndDate
            })
            .ToListAsync();

        // История обслуживания (последние 100 записей)
        dto.MaintenanceLogs = await _unitOfWork.MaintenanceLogs.GetQueryable()
            .Where(m => m.MotorId == motorId)
            .OrderByDescending(m => m.Date)
            .Take(100)
            .Select(m => new MaintenanceLogDto
            {
                Id = m.Id,
                WorkType = m.WorkType.ToString(),
                Date = m.Date,
                Comment = m.Comment,
                BearingPosition = m.BearingPosition != null ? m.BearingPosition.ToString() : null,
                LubricantTypeId = m.LubricantTypeId,
                LubricantTypeName = m.LubricantType != null ? m.LubricantType.Name : null,
                OldBearingId = m.OldBearingId,
                OldBearingType = m.OldBearing != null ? m.OldBearing.Type : null,
                NewBearingId = m.NewBearingId,
                NewBearingType = m.NewBearing != null ? m.NewBearing.Type : null
            })
            .ToListAsync();

        // Последняя смазка переднего подшипника
        var frontLubricant = await _unitOfWork.MaintenanceLogs.GetQueryable()
            .Where(m => m.MotorId == motorId
                        && m.WorkType == MaintenanceType.Lubrication
                        && m.BearingPosition == BearingPosition.Front
                        && m.LubricantType != null)
            .OrderByDescending(m => m.Date)
            .Select(m => m.LubricantType!.Name)
            .FirstOrDefaultAsync();

        var rearLubricant = await _unitOfWork.MaintenanceLogs.GetQueryable()
            .Where(m => m.MotorId == motorId
                        && m.WorkType == MaintenanceType.Lubrication
                        && m.BearingPosition == BearingPosition.Rear
                        && m.LubricantType != null)
            .OrderByDescending(m => m.Date)
            .Select(m => m.LubricantType!.Name)
            .FirstOrDefaultAsync();

        dto.FrontBearingLastLubricant = frontLubricant;
        dto.RearBearingLastLubricant = rearLubricant;

        return dto;
    }

    public async Task UpdateMotorAsync(int motorId, UpdateMotorDto dto)
    {
        _logger.LogInformation("Updating motor {MotorId}", motorId);

        var motor = await _unitOfWork.Motors.GetQueryable()
            .Include(m => m.FrontBearing)
            .Include(m => m.RearBearing)
            .FirstOrDefaultAsync(m => m.InventoryNumber == motorId);

        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с инвентарным номером {motorId} не найден");

        _mapper.Map(dto, motor);

        // Обновление подшипников, если переданы новые данные
        if (dto.FrontBearing != null)
        {
            _mapper.Map(dto.FrontBearing, motor.FrontBearing);
            _unitOfWork.Bearings.Update(motor.FrontBearing);
        }
        if (dto.RearBearing != null)
        {
            _mapper.Map(dto.RearBearing, motor.RearBearing);
            _unitOfWork.Bearings.Update(motor.RearBearing);
        }

        _unitOfWork.Motors.Update(motor);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Motor {MotorId} updated successfully", motorId);
    }

    public async Task DeleteMotorAsync(int motorId)
    {
        _logger.LogInformation("Deleting motor {MotorId}", motorId);

        var motor = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с инвентарным номером {motorId} не найден");

        _unitOfWork.Motors.Remove(motor);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Motor {MotorId} deleted successfully", motorId);
    }

    public async Task<PagedResult<MotorListItemDto>> GetMotorsPagedAsync(int page, int pageSize, string? inventoryNumberFilter, string? locationFilter, MotorStatus? statusFilter)
    {
        _logger.LogInformation("Fetching motors paged: page={Page}, pageSize={PageSize}, inventoryFilter={InventoryFilter}, locationFilter={LocationFilter}, statusFilter={StatusFilter}",
            page, pageSize, inventoryNumberFilter, locationFilter, statusFilter);

        var query = _unitOfWork.Motors.GetQueryable();

        if (!string.IsNullOrEmpty(inventoryNumberFilter))
        {
            query = query.Where(m => m.InventoryNumber.ToString().Contains(inventoryNumberFilter));
        }

        if (!string.IsNullOrEmpty(locationFilter))
        {
            query = query.Where(m => m.LocationHistories.Any(l => l.EndDate == null && l.Location.Contains(locationFilter)));
        }

        if (statusFilter.HasValue)
        {
            query = query.Where(m => m.Status == statusFilter.Value);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new MotorListItemDto
            {
                InventoryNumber = m.InventoryNumber,
                Type = m.Type,
                Power = m.Power,
                Status = m.Status.ToString(),
                CurrentLocation = m.LocationHistories
                    .Where(l => l.EndDate == null)
                    .Select(l => l.Location)
                    .FirstOrDefault() ?? string.Empty
            })
            .ToListAsync();

        return new PagedResult<MotorListItemDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }

    public async Task<PagedResult<LocationHistoryDto>> GetMotorLocationHistoryPagedAsync(int motorId, int page, int pageSize)
    {
        _logger.LogInformation("Fetching location history for motor {MotorId}, page={Page}, pageSize={PageSize}", motorId, page, pageSize);

        var motorExists = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motorExists == null)
            throw new KeyNotFoundException($"Двигатель с инвентарным номером {motorId} не найден");

        var query = _unitOfWork.LocationHistories.GetQueryable()
            .Where(l => l.MotorId == motorId)
            .OrderBy(l => l.StartDate);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new LocationHistoryDto
            {
                Id = l.Id,
                Location = l.Location,
                StartDate = l.StartDate,
                EndDate = l.EndDate
            })
            .ToListAsync();

        return new PagedResult<LocationHistoryDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }

    public async Task<PagedResult<MaintenanceLogDto>> GetMotorMaintenanceLogsPagedAsync(int motorId, int page, int pageSize)
    {
        _logger.LogInformation("Fetching maintenance logs for motor {MotorId}, page={Page}, pageSize={PageSize}", motorId, page, pageSize);

        var motorExists = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motorExists == null)
            throw new KeyNotFoundException($"Двигатель с инвентарным номером {motorId} не найден");

        var query = _unitOfWork.MaintenanceLogs.GetQueryable()
            .Where(m => m.MotorId == motorId)
            .OrderByDescending(m => m.Date);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new MaintenanceLogDto
            {
                Id = m.Id,
                WorkType = m.WorkType.ToString(),
                Date = m.Date,
                Comment = m.Comment,
                BearingPosition = m.BearingPosition != null ? m.BearingPosition.ToString() : null,
                LubricantTypeId = m.LubricantTypeId,
                LubricantTypeName = m.LubricantType != null ? m.LubricantType.Name : null,
                OldBearingId = m.OldBearingId,
                OldBearingType = m.OldBearing != null ? m.OldBearing.Type : null,
                NewBearingId = m.NewBearingId,
                NewBearingType = m.NewBearing != null ? m.NewBearing.Type : null
            })
            .ToListAsync();

        return new PagedResult<MaintenanceLogDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }

    public async Task UpdateMaintenanceLogAsync(int motorId, int logId, UpdateMaintenanceLogDto dto)
    {
        _logger.LogInformation("Updating maintenance log {LogId} for motor {MotorId}", logId, motorId);

        var motor = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с инвентарным номером {motorId} не найден");

        var log = await _unitOfWork.MaintenanceLogs.GetQueryable()
            .Include(l => l.NewBearing)
            .FirstOrDefaultAsync(l => l.Id == logId && l.MotorId == motorId);

        if (log == null)
            throw new KeyNotFoundException($"Запись обслуживания с id {logId} не найдена для двигателя {motorId}");

        if (dto.Comment != null)
            log.Comment = dto.Comment;

        if (log.WorkType == MaintenanceType.Lubrication)
        {
            if (dto.LubricantTypeId.HasValue)
            {
                var lubricantExists = await _unitOfWork.LubricantTypes.ExistsAsync(dto.LubricantTypeId.Value);
                if (!lubricantExists)
                    throw new ArgumentException($"Тип смазки с id {dto.LubricantTypeId} не существует");
                log.LubricantTypeId = dto.LubricantTypeId;
            }
            if (dto.NewBearing != null)
                throw new InvalidOperationException("Невозможно изменить данные подшипника для операции смазки");
        }
        else if (log.WorkType == MaintenanceType.BearingReplacement)
        {
            if (dto.NewBearing != null)
            {
                var newBearing = _mapper.Map<Bearing>(dto.NewBearing);
                await _unitOfWork.Bearings.AddAsync(newBearing);
                await _unitOfWork.SaveChangesAsync();

                if (log.BearingPosition == BearingPosition.Front)
                {
                    motor.FrontBearingId = newBearing.Id;
                    motor.FrontBearing = newBearing;
                }
                else if (log.BearingPosition == BearingPosition.Rear)
                {
                    motor.RearBearingId = newBearing.Id;
                    motor.RearBearing = newBearing;
                }

                log.NewBearingId = newBearing.Id;
                _unitOfWork.Motors.Update(motor);
            }
            if (dto.LubricantTypeId.HasValue)
                throw new InvalidOperationException("Для замены подшипника нельзя указывать тип смазки");
        }
        else
        {
            if (dto.LubricantTypeId.HasValue || dto.NewBearing != null)
                throw new InvalidOperationException("Для данного типа работ нельзя указывать тип смазки или подшипник");
        }

        _unitOfWork.MaintenanceLogs.Update(log);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Maintenance log {LogId} for motor {MotorId} updated", logId, motorId);
    }

    public async Task DeleteMaintenanceLogAsync(int motorId, int logId)
    {
        _logger.LogInformation("Deleting maintenance log {LogId} for motor {MotorId}", logId, motorId);

        var motor = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с инвентарным номером {motorId} не найден");

        var log = await _unitOfWork.MaintenanceLogs.GetByIdAsync(logId);
        if (log == null || log.MotorId != motorId)
            throw new KeyNotFoundException($"Запись обслуживания с id {logId} не найдена для двигателя {motorId}");

        _unitOfWork.MaintenanceLogs.Remove(log);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Maintenance log {LogId} for motor {MotorId} deleted", logId, motorId);
    }

    public async Task UpdateLocationHistoryAsync(int motorId, int locationHistoryId, UpdateLocationHistoryDto dto)
    {
        _logger.LogInformation("Updating location history {LocationHistoryId} for motor {MotorId}", locationHistoryId, motorId);

        var motor = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с инвентарным номером {motorId} не найден");

        var locationHistory = await _unitOfWork.LocationHistories.GetByIdAsync(locationHistoryId);
        if (locationHistory == null || locationHistory.MotorId != motorId)
            throw new KeyNotFoundException($"Запись истории перемещений с id {locationHistoryId} не найдена для двигателя {motorId}");

        locationHistory.Location = dto.Location;
        _unitOfWork.LocationHistories.Update(locationHistory);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Location history {LocationHistoryId} for motor {MotorId} updated", locationHistoryId, motorId);
    }

    public async Task DeleteLocationHistoryAsync(int motorId, int locationHistoryId)
    {
        _logger.LogInformation("Deleting location history {LocationHistoryId} for motor {MotorId}", locationHistoryId, motorId);

        var motor = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с инвентарным номером {motorId} не найден");

        var locationHistory = await _unitOfWork.LocationHistories.GetByIdAsync(locationHistoryId);
        if (locationHistory == null || locationHistory.MotorId != motorId)
            throw new KeyNotFoundException($"Запись истории перемещений с id {locationHistoryId} не найдена для двигателя {motorId}");

        var allHistories = await _unitOfWork.LocationHistories.GetQueryable()
            .Where(l => l.MotorId == motorId)
            .OrderBy(l => l.StartDate)
            .ToListAsync();

        if (allHistories.Count == 1)
            throw new InvalidOperationException("Нельзя удалить единственную запись истории перемещений – двигатель должен иметь текущее местоположение");

        var index = allHistories.FindIndex(h => h.Id == locationHistoryId);

        if (locationHistory.EndDate == null)
        {
            if (index > 0)
            {
                var previous = allHistories[index - 1];
                previous.EndDate = null;
                _unitOfWork.LocationHistories.Update(previous);
            }
            else
            {
                throw new InvalidOperationException("Нельзя удалить единственную активную запись местоположения – двигатель останется без текущего места");
            }

            _unitOfWork.LocationHistories.Remove(locationHistory);
            await _unitOfWork.SaveChangesAsync();
            _logger.LogInformation("Active location history {LocationHistoryId} for motor {MotorId} deleted, previous record became active", locationHistoryId, motorId);
            return;
        }

        if (index == allHistories.Count - 1)
        {
            _unitOfWork.LocationHistories.Remove(locationHistory);
            await _unitOfWork.SaveChangesAsync();
            _logger.LogInformation("Closed last location history {LocationHistoryId} for motor {MotorId} deleted", locationHistoryId, motorId);
        }
        else
        {
            throw new InvalidOperationException("Удаление промежуточных записей истории перемещений запрещено, так как это нарушит непрерывность временной линии. Можно отредактировать Location или удалить только последнюю запись.");
        }
    }
}