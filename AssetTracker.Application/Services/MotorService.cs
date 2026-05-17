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

        string? oldBearingType = null;

        // Валидация для смазки
        if (dto.WorkType == MaintenanceType.Lubrication)
        {
            if (!dto.BearingPosition.HasValue)
                throw new ArgumentException("Для смазки необходимо указать позицию подшипника");
            if (!dto.LubricantTypeId.HasValue)
                throw new ArgumentException("Для смазки необходимо указать тип смазки");

            var lubricantExists = await _unitOfWork.LubricantTypes.ExistsAsync(dto.LubricantTypeId.Value);
            if (!lubricantExists)
                throw new ArgumentException($"Тип смазки с id {dto.LubricantTypeId} не существует");
        }

        // Валидация для замены подшипника
        if (dto.WorkType == MaintenanceType.BearingReplacement)
        {
            if (!dto.BearingPosition.HasValue)
                throw new ArgumentException("Для замены подшипника необходимо указать позицию (передний/задний)");
            if (string.IsNullOrWhiteSpace(dto.NewBearingType))
                throw new ArgumentException("Для замены подшипника необходимо указать новый тип подшипника");

            // Сохраняем старый тип подшипника до обновления
            if (dto.BearingPosition.Value == BearingPosition.Front)
            {
                oldBearingType = motor.FrontBearingType;
                motor.FrontBearingType = dto.NewBearingType;
            }
            else if (dto.BearingPosition.Value == BearingPosition.Rear)
            {
                oldBearingType = motor.RearBearingType;
                motor.RearBearingType = dto.NewBearingType;
            }

            _unitOfWork.Motors.Update(motor);
        }

        var maintenance = new MaintenanceLog
        {
            MotorId = motorId,
            WorkType = dto.WorkType,
            Date = DateTime.UtcNow,
            Comment = dto.Comment,
            BearingPosition = dto.BearingPosition,
            LubricantTypeId = dto.LubricantTypeId,
            OldBearingType = oldBearingType,                 // Сохраняем старый тип
            NewBearingType = dto.WorkType == MaintenanceType.BearingReplacement ? dto.NewBearingType : null
        };

        await _unitOfWork.MaintenanceLogs.AddAsync(maintenance);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Maintenance recorded for motor {MotorId}", motorId);
    }

    public async Task<MotorFullHistoryDto> GetFullHistoryAsync(int motorId)
    {
        _logger.LogInformation("Fetching full history for motor {MotorId}", motorId);

        // 1. Загружаем только сам двигатель (без навигационных коллекций)
        var motor = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с инвентарным номером {motorId} не найден");

        var dto = _mapper.Map<MotorFullHistoryDto>(motor);

        // 2. История перемещений (обычно не миллионы записей, но всё же делаем проекцию)
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

        // 3. История обслуживания – ограничиваем последними 100 записями для мобильных устройств
        //    Полную историю можно получить через пагинированный эндпоинт
        // ИСПРАВЛЕНО: добавлены поля OldBearingType и NewBearingType
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
                OldBearingType = m.OldBearingType,
                NewBearingType = m.NewBearingType
            })
            .ToListAsync();

        // 4. Последняя смазка переднего подшипника – один быстрый запрос с индексом
        var frontLubricant = await _unitOfWork.MaintenanceLogs.GetQueryable()
            .Where(m => m.MotorId == motorId
                        && m.WorkType == MaintenanceType.Lubrication
                        && m.BearingPosition == BearingPosition.Front
                        && m.LubricantType != null)
            .OrderByDescending(m => m.Date)
            .Select(m => m.LubricantType!.Name)
            .FirstOrDefaultAsync();

        // 5. Последняя смазка заднего подшипника
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

    //  Обновление основных характеристик двигателя
    public async Task UpdateMotorAsync(int motorId, UpdateMotorDto dto)
    {
        _logger.LogInformation("Updating motor {MotorId}", motorId);

        var motor = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с инвентарным номером {motorId} не найден");

        _mapper.Map(dto, motor); // Обновляем только разрешённые поля
        _unitOfWork.Motors.Update(motor);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Motor {MotorId} updated successfully", motorId);
    }

    // Удаление двигателя и всей связанной истории (каскадное удаление в БД)
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

    // Реализация новых методов

    public async Task<PagedResult<MotorListItemDto>> GetMotorsPagedAsync(int page, int pageSize, string? inventoryNumberFilter, string? locationFilter, MotorStatus? statusFilter)
    {
        _logger.LogInformation("Fetching motors paged: page={Page}, pageSize={PageSize}, inventoryFilter={InventoryFilter}, locationFilter={LocationFilter}, statusFilter={StatusFilter}",
            page, pageSize, inventoryNumberFilter, locationFilter, statusFilter);

        var query = _unitOfWork.Motors.GetQueryable();

        // Фильтрация по инвентарному номеру (частичное совпадение, как строка)
        if (!string.IsNullOrEmpty(inventoryNumberFilter))
        {
            query = query.Where(m => m.InventoryNumber.ToString().Contains(inventoryNumberFilter));
        }

        // Фильтрация по текущему месту установки (активная запись LocationHistory)
        if (!string.IsNullOrEmpty(locationFilter))
        {
            query = query.Where(m => m.LocationHistories.Any(l => l.EndDate == null && l.Location.Contains(locationFilter)));
        }

        // Фильтрация по статусу
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
            .OrderBy(l => l.StartDate); // как в GetFullHistory – по возрастанию

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
        // ИСПРАВЛЕНО: добавлены поля OldBearingType и NewBearingType
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
                OldBearingType = m.OldBearingType,
                NewBearingType = m.NewBearingType
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

    /// <summary>
    /// Редактирование записи обслуживания
    /// </summary>
    public async Task UpdateMaintenanceLogAsync(int motorId, int logId, UpdateMaintenanceLogDto dto)
    {
        _logger.LogInformation("Updating maintenance log {LogId} for motor {MotorId}", logId, motorId);

        var motor = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с инвентарным номером {motorId} не найден");

        var log = await _unitOfWork.MaintenanceLogs.GetByIdAsync(logId);
        if (log == null || log.MotorId != motorId)
            throw new KeyNotFoundException($"Запись обслуживания с id {logId} не найдена для двигателя {motorId}");

        // Обновляем комментарий, если передан
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
            if (dto.NewBearingType != null)
                throw new InvalidOperationException("Невозможно изменить тип подшипника для операции смазки");
        }
        else if (log.WorkType == MaintenanceType.BearingReplacement)
        {
            // Разрешаем менять новый тип подшипника
            if (dto.NewBearingType != null)
            {
                log.NewBearingType = dto.NewBearingType;

                // Обновляем соответствующий подшипник в двигателе
                if (log.BearingPosition == BearingPosition.Front)
                    motor.FrontBearingType = dto.NewBearingType;
                else if (log.BearingPosition == BearingPosition.Rear)
                    motor.RearBearingType = dto.NewBearingType;

                _unitOfWork.Motors.Update(motor);
            }
            if (dto.LubricantTypeId.HasValue)
                throw new InvalidOperationException("Для замены подшипника нельзя указывать тип смазки");
        }
        else
        {
            if (dto.LubricantTypeId.HasValue)
                throw new InvalidOperationException("Для данного типа работ нельзя указывать тип смазки");
            if (dto.NewBearingType != null)
                throw new InvalidOperationException("Для данного типа работ нельзя указывать тип подшипника");
        }

        _unitOfWork.MaintenanceLogs.Update(log);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Maintenance log {LogId} for motor {MotorId} updated", logId, motorId);
    }

    /// <summary>
    /// Удаление записи обслуживания
    /// </summary>
    public async Task DeleteMaintenanceLogAsync(int motorId, int logId)
    {
        _logger.LogInformation("Deleting maintenance log {LogId} for motor {MotorId}", logId, motorId);

        // Проверяем существование двигателя
        var motor = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с инвентарным номером {motorId} не найден");

        // Загружаем запись обслуживания
        var log = await _unitOfWork.MaintenanceLogs.GetByIdAsync(logId);
        if (log == null || log.MotorId != motorId)
            throw new KeyNotFoundException($"Запись обслуживания с id {logId} не найдена для двигателя {motorId}");

        // При удалении записи о замене подшипника не откатываем состояние двигателя,
        // так как замена уже произошла физически. Удаление записи – лишь удаление исторического факта.
        // Просто удаляем запись.
        _unitOfWork.MaintenanceLogs.Remove(log);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Maintenance log {LogId} for motor {MotorId} deleted", logId, motorId);
    }

    public async Task UpdateLocationHistoryAsync(int motorId, int locationHistoryId, UpdateLocationHistoryDto dto)
    {
        _logger.LogInformation("Updating location history {LocationHistoryId} for motor {MotorId}", locationHistoryId, motorId);

        // Проверяем существование двигателя
        var motor = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с инвентарным номером {motorId} не найден");

        // Загружаем запись истории
        var locationHistory = await _unitOfWork.LocationHistories.GetByIdAsync(locationHistoryId);
        if (locationHistory == null || locationHistory.MotorId != motorId)
            throw new KeyNotFoundException($"Запись истории перемещений с id {locationHistoryId} не найдена для двигателя {motorId}");

        // Редактируем только Location, даты не трогаем
        locationHistory.Location = dto.Location;
        _unitOfWork.LocationHistories.Update(locationHistory);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Location history {LocationHistoryId} for motor {MotorId} updated", locationHistoryId, motorId);
    }

    public async Task DeleteLocationHistoryAsync(int motorId, int locationHistoryId)
    {
        _logger.LogInformation("Deleting location history {LocationHistoryId} for motor {MotorId}", locationHistoryId, motorId);

        // Проверяем двигатель
        var motor = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с инвентарным номером {motorId} не найден");

        // Загружаем запись
        var locationHistory = await _unitOfWork.LocationHistories.GetByIdAsync(locationHistoryId);
        if (locationHistory == null || locationHistory.MotorId != motorId)
            throw new KeyNotFoundException($"Запись истории перемещений с id {locationHistoryId} не найдена для двигателя {motorId}");

        // Получаем все записи истории для этого двигателя, отсортированные по StartDate
        var allHistories = await _unitOfWork.LocationHistories.GetQueryable()
            .Where(l => l.MotorId == motorId)
            .OrderBy(l => l.StartDate)
            .ToListAsync();

        if (allHistories.Count == 1)
            throw new InvalidOperationException("Нельзя удалить единственную запись истории перемещений – двигатель должен иметь текущее местоположение");

        // Определяем индекс удаляемой записи
        var index = allHistories.FindIndex(h => h.Id == locationHistoryId);

        // Случай 1: запись активная (EndDate == null)
        if (locationHistory.EndDate == null)
        {
            // Находим предыдущую запись (если есть)
            if (index > 0)
            {
                var previous = allHistories[index - 1];
                previous.EndDate = null; // делаем предыдущую запись активной
                _unitOfWork.LocationHistories.Update(previous);
            }
            else
            {
                // Это первая запись, и она активная – удалять нельзя, т.к. не останется активной записи
                throw new InvalidOperationException("Нельзя удалить единственную активную запись местоположения – двигатель останется без текущего места");
            }

            _unitOfWork.LocationHistories.Remove(locationHistory);
            await _unitOfWork.SaveChangesAsync();
            _logger.LogInformation("Active location history {LocationHistoryId} for motor {MotorId} deleted, previous record became active", locationHistoryId, motorId);
            return;
        }

        // Случай 2: запись закрытая (EndDate != null) – удаляем только если это последняя запись
        if (index == allHistories.Count - 1)
        {
            // Последняя запись, просто удаляем
            _unitOfWork.LocationHistories.Remove(locationHistory);
            await _unitOfWork.SaveChangesAsync();
            _logger.LogInformation("Closed last location history {LocationHistoryId} for motor {MotorId} deleted", locationHistoryId, motorId);
        }
        else
        {
            // Запись не последняя – удаление разорвёт временную цепочку, запрещаем
            throw new InvalidOperationException("Удаление промежуточных записей истории перемещений запрещено, так как это нарушит непрерывность временной линии. Можно отредактировать Location или удалить только последнюю запись.");
        }
    }
}