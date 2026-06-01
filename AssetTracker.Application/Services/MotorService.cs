using AssetTracker.Application.DTOs;
using AssetTracker.Application.Interfaces;
using AssetTracker.Domain.Entities;
using AssetTracker.Domain.Enums;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AssetTracker.Application.Services;

/// <summary>
/// Сервис для управления электродвигателями, их историей и обслуживанием.
/// </summary>
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

    /// <inheritdoc />
    public async Task<IEnumerable<MotorListItemDto>> GetAllMotorsAsync()
    {
        _logger.LogInformation("Получение всех двигателей");
        var motors = await _unitOfWork.Motors.GetAllAsync();

        var motorList = new List<MotorListItemDto>();
        foreach (var motor in motors)
        {
            var currentLocation = await _unitOfWork.LocationHistories.GetQueryable()
                .Where(l => l.MotorId == motor.Id && l.EndDate == null)
                .Select(l => l.Location)
                .FirstOrDefaultAsync() ?? string.Empty;

            motorList.Add(new MotorListItemDto
            {
                Id = motor.Id,
                InventoryNumber = motor.InventoryNumber,
                Type = motor.Type,
                Power = motor.Power,
                Status = motor.Status.ToString(),
                CurrentLocation = currentLocation,
                MountingType=motor.MountingType,
            });
        }
        return motorList;
    }

    /// <inheritdoc />
    public async Task<MotorFullHistoryDto> CreateMotorAsync(CreateMotorDto dto)
    {
        _logger.LogInformation("Создание нового двигателя, инвентарный номер: {InventoryNumber}", dto.InventoryNumber ?? "отсутствует");

        // Проверка уникальности инвентарного номера, если он задан
        if (!string.IsNullOrWhiteSpace(dto.InventoryNumber))
        {
            var existingByInv = await _unitOfWork.Motors.GetByInventoryNumberAsync(dto.InventoryNumber);
            if (existingByInv != null)
                throw new InvalidOperationException($"Двигатель с инвентарным номером {dto.InventoryNumber} уже существует");
        }

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
            MotorId = motor.Id,
            Location = dto.InitialLocation,
            StartDate = DateTime.UtcNow,
            EndDate = null,
            Status = motor.Status
        };
        await _unitOfWork.LocationHistories.AddAsync(location);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Двигатель создан с Id {MotorId}", motor.Id);
        return await GetFullHistoryAsync(motor.Id);
    }

    /// <inheritdoc />
    public async Task SetInventoryNumberAsync(int motorId, SetInventoryNumberDto dto)
    {
        _logger.LogInformation("Установка инвентарного номера для двигателя {MotorId}: {InventoryNumber}", motorId, dto.InventoryNumber ?? "null");

        var motor = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с Id {motorId} не найден");

        // Проверка уникальности нового номера (если не null)
        if (!string.IsNullOrWhiteSpace(dto.InventoryNumber))
        {
            var existing = await _unitOfWork.Motors.GetByInventoryNumberAsync(dto.InventoryNumber);
            if (existing != null && existing.Id != motorId)
                throw new InvalidOperationException($"Инвентарный номер {dto.InventoryNumber} уже используется другим двигателем");
        }

        motor.InventoryNumber = dto.InventoryNumber;
        _unitOfWork.Motors.Update(motor);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Инвентарный номер двигателя {MotorId} установлен в {InventoryNumber}", motorId, dto.InventoryNumber ?? "null");
    }

    /// <inheritdoc />
    public async Task MoveMotorAsync(int motorId, MoveMotorDto dto)
    {
        _logger.LogInformation("Перемещение двигателя {MotorId} в {NewLocation}", motorId, dto.NewLocation);

        var motor = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с Id {motorId} не найден");

        if (dto.NewStatus.HasValue && motor.Status != dto.NewStatus.Value)
        {
            _logger.LogInformation("Изменение статуса двигателя {MotorId} с {OldStatus} на {NewStatus}",
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
            EndDate = null,
            Status = motor.Status
        };
        await _unitOfWork.LocationHistories.AddAsync(newLocation);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Двигатель {MotorId} перемещён в {NewLocation}", motorId, dto.NewLocation);
    }

    /// <inheritdoc />
    public async Task AddMaintenanceAsync(int motorId, MaintenanceDto dto)
    {
        _logger.LogInformation("Добавление обслуживания для двигателя {MotorId}, тип {WorkType}", motorId, dto.WorkType);

        var motor = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с Id {motorId} не найден");

        int? oldBearingId = null;
        int? newBearingId = null;

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

        // Валидация и обработка замены подшипника
        if (dto.WorkType == MaintenanceType.BearingReplacement)
        {
            if (!dto.BearingPosition.HasValue)
                throw new ArgumentException("Для замены подшипника необходимо указать позицию (передний/задний)");

            // Сохраняем старый подшипник
            if (dto.BearingPosition.Value == BearingPosition.Front)
                oldBearingId = motor.FrontBearingId;
            else
                oldBearingId = motor.RearBearingId;

            // Определяем новый подшипник
            if (dto.ExistingBearingId.HasValue)
            {
                // Используем существующий подшипник
                var existingBearing = await _unitOfWork.Bearings.GetByIdAsync(dto.ExistingBearingId.Value);
                if (existingBearing == null)
                    throw new ArgumentException($"Подшипник с id {dto.ExistingBearingId.Value} не существует");
                newBearingId = existingBearing.Id;
            }
            else if (dto.NewBearing != null)
            {
                // Создаём новый подшипник
                var newBearing = _mapper.Map<Bearing>(dto.NewBearing);
                await _unitOfWork.Bearings.AddAsync(newBearing);
                await _unitOfWork.SaveChangesAsync();
                newBearingId = newBearing.Id;
            }
            else
            {
                throw new ArgumentException("Для замены подшипника необходимо указать ExistingBearingId или NewBearing");
            }

            // Обновляем ссылку в моторе
            if (dto.BearingPosition.Value == BearingPosition.Front)
                motor.FrontBearingId = newBearingId.Value;
            else
                motor.RearBearingId = newBearingId.Value;

            _unitOfWork.Motors.Update(motor);
        }

        var maintenance = new MaintenanceLog
        {
            MotorId = motorId,
            WorkType = dto.WorkType,
            Date = DateTime.UtcNow,
            Comment = dto.Comment,
            PerformedBy = dto.PerformedBy,
            BearingPosition = dto.BearingPosition,
            LubricantTypeId = dto.LubricantTypeId,
            OldBearingId = oldBearingId,
            NewBearingId = newBearingId
        };

        await _unitOfWork.MaintenanceLogs.AddAsync(maintenance);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Обслуживание для двигателя {MotorId} записано", motorId);
    }

    /// <inheritdoc />
    public async Task<MotorFullHistoryDto> GetFullHistoryAsync(int motorId)
    {
        _logger.LogInformation("Получение полной истории для двигателя {MotorId}", motorId);

        var motor = await _unitOfWork.Motors.GetQueryable()
            .Include(m => m.FrontBearing)
            .Include(m => m.RearBearing)
            .FirstOrDefaultAsync(m => m.Id == motorId);

        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с Id {motorId} не найден");

        var dto = _mapper.Map<MotorFullHistoryDto>(motor);
        dto.Id = motor.Id;
        dto.InventoryNumber = motor.InventoryNumber;

        // История перемещений – сортировка по убыванию даты начала (сначала новые)
        dto.LocationHistory = await _unitOfWork.LocationHistories.GetQueryable()
            .Where(l => l.MotorId == motorId)
            .OrderByDescending(l => l.StartDate)
            .Select(l => new LocationHistoryDto
            {
                Id = l.Id,
                Location = l.Location,
                StartDate = l.StartDate,
                EndDate = l.EndDate,
                Status = l.Status.ToString()
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
                PerformedBy = m.PerformedBy,
                BearingPosition = m.BearingPosition != null ? m.BearingPosition.ToString() : null,
                LubricantTypeId = m.LubricantTypeId,
                LubricantTypeName = m.LubricantType != null ? m.LubricantType.Name : null,
                OldBearing = m.OldBearing != null ? new BearingDto
                {
                    Id = m.OldBearing.Id,
                    Type = m.OldBearing.Type,
                    Manufacturer = m.OldBearing.Manufacturer,
                    Supplier = m.OldBearing.Supplier
                } : null,
                NewBearing = m.NewBearing != null ? new BearingDto
                {
                    Id = m.NewBearing.Id,
                    Type = m.NewBearing.Type,
                    Manufacturer = m.NewBearing.Manufacturer,
                    Supplier = m.NewBearing.Supplier
                } : null
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

        // Последняя смазка заднего подшипника
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

    /// <inheritdoc />
    public async Task UpdateMotorAsync(int motorId, UpdateMotorDto dto)
    {
        _logger.LogInformation("Обновление характеристик двигателя {MotorId}", motorId);

        var motor = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с Id {motorId} не найден");

        _mapper.Map(dto, motor);
        _unitOfWork.Motors.Update(motor);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Двигатель {MotorId} обновлён", motorId);
    }

    /// <inheritdoc />
    public async Task DeleteMotorAsync(int motorId)
    {
        _logger.LogInformation("Удаление двигателя {MotorId}", motorId);

        var motor = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с Id {motorId} не найден");

        _unitOfWork.Motors.Remove(motor);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Двигатель {MotorId} удалён", motorId);
    }

    /// <inheritdoc />
    public async Task<PagedResult<MotorListItemDto>> GetMotorsPagedAsync(
        int page,
        int pageSize,
        string? inventoryNumberFilter,
        string? locationFilter,
        MotorStatus? statusFilter,
        bool? hasInventoryNumber = null)
    {
        _logger.LogInformation("Получение списка двигателей с пагинацией: page={Page}, pageSize={PageSize}, hasInventoryNumber={HasInventoryNumber}",
            page, pageSize, hasInventoryNumber);

        var query = _unitOfWork.Motors.GetQueryable();

        if (!string.IsNullOrEmpty(inventoryNumberFilter))
            query = query.Where(m => m.InventoryNumber != null && EF.Functions.ILike(m.InventoryNumber, $"%{inventoryNumberFilter}%"));

        if (statusFilter.HasValue)
            query = query.Where(m => m.Status == statusFilter.Value);

        // Фильтрация по текущему местоположению
        if (!string.IsNullOrEmpty(locationFilter))
        {
            query = query.Where(m => m.LocationHistories.Any(l =>
                l.EndDate == null && EF.Functions.ILike(l.Location, $"%{locationFilter}%")));
        }

        // НОВОЕ: фильтрация по наличию инвентарного номера
        if (hasInventoryNumber.HasValue)
        {
            if (hasInventoryNumber.Value)
                query = query.Where(m => m.InventoryNumber != null);
            else
                query = query.Where(m => m.InventoryNumber == null);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new MotorListItemDto
            {
                Id = m.Id,
                InventoryNumber = m.InventoryNumber,
                Type = m.Type,
                Power = m.Power,
                Status = m.Status.ToString(),
                MountingType= m.MountingType,
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

    /// <inheritdoc />
    public async Task<PagedResult<LocationHistoryDto>> GetMotorLocationHistoryPagedAsync(int motorId, int page, int pageSize)
    {
        _logger.LogInformation("Получение истории перемещений для двигателя {MotorId}, page={Page}, pageSize={PageSize}", motorId, page, pageSize);

        var motorExists = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motorExists == null)
            throw new KeyNotFoundException($"Двигатель с Id {motorId} не найден");

        // Сортировка по убыванию даты начала (самые новые перемещения первыми)
        var query = _unitOfWork.LocationHistories.GetQueryable()
            .Where(l => l.MotorId == motorId)
            .OrderByDescending(l => l.StartDate);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new LocationHistoryDto
            {
                Id = l.Id,
                Location = l.Location,
                StartDate = l.StartDate,
                EndDate = l.EndDate,
                Status = l.Status.ToString()
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

    /// <inheritdoc />
    public async Task<PagedResult<MaintenanceLogDto>> GetMotorMaintenanceLogsPagedAsync(
        int motorId,
        int page,
        int pageSize,
        MaintenanceType? workType,
        DateTime? fromDate,
        DateTime? toDate)
    {
        _logger.LogInformation("Получение журнала обслуживания для двигателя {MotorId}, page={Page}, pageSize={PageSize}, workType={WorkType}, from={From}, to={To}",
            motorId, page, pageSize, workType, fromDate, toDate);

        // Проверка существования мотора
        var motorExists = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motorExists == null)
            throw new KeyNotFoundException($"Двигатель с Id {motorId} не найден");

        // Валидация диапазона дат
        if (fromDate.HasValue && toDate.HasValue && fromDate > toDate)
            throw new ArgumentException("Дата начала не может быть позже даты окончания");

        // Базовый запрос
        var query = _unitOfWork.MaintenanceLogs.GetQueryable()
            .Where(m => m.MotorId == motorId);

        // Применяем фильтры
        if (workType.HasValue)
            query = query.Where(m => m.WorkType == workType.Value);

        if (fromDate.HasValue)
            query = query.Where(m => m.Date >= fromDate.Value);

        if (toDate.HasValue)
            // Чтобы включить весь указанный день, добавляем один день и берём меньше
            query = query.Where(m => m.Date < toDate.Value.AddDays(1));

        // Сортировка по убыванию даты (свежие сверху)
        query = query.OrderByDescending(m => m.Date);

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
                PerformedBy = m.PerformedBy,
                BearingPosition = m.BearingPosition != null ? m.BearingPosition.ToString() : null,
                LubricantTypeId = m.LubricantTypeId,
                LubricantTypeName = m.LubricantType != null ? m.LubricantType.Name : null,
                OldBearing = m.OldBearing != null ? new BearingDto
                {
                    Id = m.OldBearing.Id,
                    Type = m.OldBearing.Type,
                    Manufacturer = m.OldBearing.Manufacturer,
                    Supplier = m.OldBearing.Supplier
                } : null,
                NewBearing = m.NewBearing != null ? new BearingDto
                {
                    Id = m.NewBearing.Id,
                    Type = m.NewBearing.Type,
                    Manufacturer = m.NewBearing.Manufacturer,
                    Supplier = m.NewBearing.Supplier
                } : null
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
    /// Проверяет, является ли запись о замене подшипника последней для данной позиции (передней/задней).
    /// Возвращает true, если это последняя запись замены для указанной позиции.
    /// </summary>
    private async Task<bool> IsLastBearingReplacementAsync(int motorId, BearingPosition position, int logId)
    {
        // Находим самую последнюю запись замены подшипника для указанной позиции
        var lastLog = await _unitOfWork.MaintenanceLogs.GetQueryable()
            .Where(m => m.MotorId == motorId
                        && m.WorkType == MaintenanceType.BearingReplacement
                        && m.BearingPosition == position)
            .OrderByDescending(m => m.Date)
            .FirstOrDefaultAsync();

        return lastLog != null && lastLog.Id == logId;
    }

    /// <inheritdoc />
    public async Task UpdateMaintenanceLogAsync(int motorId, int logId, UpdateMaintenanceLogDto dto)
    {
        _logger.LogInformation("Обновление записи обслуживания {LogId} для двигателя {MotorId}", logId, motorId);

        var motor = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с Id {motorId} не найден");

        var log = await _unitOfWork.MaintenanceLogs.GetQueryable()
            .Include(l => l.OldBearing)
            .Include(l => l.NewBearing)
            .FirstOrDefaultAsync(l => l.Id == logId && l.MotorId == motorId);

        if (log == null)
            throw new KeyNotFoundException($"Запись обслуживания с id {logId} не найдена для двигателя {motorId}");

        // Обновляем комментарий, если передан
        if (dto.Comment != null)
            log.Comment = dto.Comment;

        // Обновляем исполнителя, если передан
        if (!string.IsNullOrWhiteSpace(dto.PerformedBy))
            log.PerformedBy = dto.PerformedBy;

        if (log.WorkType == MaintenanceType.Lubrication)
        {
            if (dto.LubricantTypeId.HasValue)
            {
                var lubricantExists = await _unitOfWork.LubricantTypes.ExistsAsync(dto.LubricantTypeId.Value);
                if (!lubricantExists)
                    throw new ArgumentException($"Тип смазки с id {dto.LubricantTypeId} не существует");
                log.LubricantTypeId = dto.LubricantTypeId;
            }
            if (dto.ExistingBearingId.HasValue || dto.NewBearing != null)
                throw new InvalidOperationException("Для операции смазки нельзя изменять подшипник");
        }
        else if (log.WorkType == MaintenanceType.BearingReplacement)
        {
            // Разрешаем редактирование ТОЛЬКО если это последняя запись замены для данного подшипника
            if (!await IsLastBearingReplacementAsync(motorId, log.BearingPosition!.Value, logId))
                throw new InvalidOperationException("Редактирование разрешено только для последней записи замены подшипника. " +
                                                    "Чтобы изменить более раннюю замену, удалите последующие записи.");

            // Можно изменить подшипник (новый) на другой
            int? newBearingId = null;
            if (dto.ExistingBearingId.HasValue)
            {
                var existingBearing = await _unitOfWork.Bearings.GetByIdAsync(dto.ExistingBearingId.Value);
                if (existingBearing == null)
                    throw new ArgumentException($"Подшипник с id {dto.ExistingBearingId.Value} не существует");
                newBearingId = existingBearing.Id;
            }
            else if (dto.NewBearing != null)
            {
                var newBearing = _mapper.Map<Bearing>(dto.NewBearing);
                await _unitOfWork.Bearings.AddAsync(newBearing);
                await _unitOfWork.SaveChangesAsync();
                newBearingId = newBearing.Id;
            }

            if (newBearingId.HasValue)
            {
                // Обновляем ссылку в моторе
                if (log.BearingPosition == BearingPosition.Front)
                    motor.FrontBearingId = newBearingId.Value;
                else if (log.BearingPosition == BearingPosition.Rear)
                    motor.RearBearingId = newBearingId.Value;
                _unitOfWork.Motors.Update(motor);

                // Обновляем запись обслуживания
                log.NewBearingId = newBearingId;
            }

            if (dto.LubricantTypeId.HasValue)
                throw new InvalidOperationException("Для замены подшипника нельзя указывать тип смазки");
        }
        else
        {
            if (dto.LubricantTypeId.HasValue || dto.ExistingBearingId.HasValue || dto.NewBearing != null)
                throw new InvalidOperationException("Для данного типа работ нельзя изменять смазку или подшипник");
        }

        _unitOfWork.MaintenanceLogs.Update(log);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Запись обслуживания {LogId} для двигателя {MotorId} обновлена", logId, motorId);
    }

    /// <inheritdoc />
    public async Task DeleteMaintenanceLogAsync(int motorId, int logId)
    {
        _logger.LogInformation("Удаление записи обслуживания {LogId} для двигателя {MotorId}", logId, motorId);

        var motor = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с Id {motorId} не найден");

        var log = await _unitOfWork.MaintenanceLogs.GetByIdAsync(logId);
        if (log == null || log.MotorId != motorId)
            throw new KeyNotFoundException($"Запись обслуживания с id {logId} не найдена для двигателя {motorId}");

        // Если это замена подшипника, разрешаем удаление ТОЛЬКО если это последняя запись замены для данной позиции
        if (log.WorkType == MaintenanceType.BearingReplacement)
        {
            if (!await IsLastBearingReplacementAsync(motorId, log.BearingPosition!.Value, logId))
                throw new InvalidOperationException("Удаление разрешено только для последней записи замены подшипника. " +
                                                    "Чтобы удалить более раннюю замену, сначала удалите последующие записи.");

            // Откатываем мотор на старый подшипник
            if (log.OldBearingId.HasValue)
            {
                if (log.BearingPosition == BearingPosition.Front)
                    motor.FrontBearingId = log.OldBearingId.Value;
                else if (log.BearingPosition == BearingPosition.Rear)
                    motor.RearBearingId = log.OldBearingId.Value;
                _unitOfWork.Motors.Update(motor);
            }
        }

        _unitOfWork.MaintenanceLogs.Remove(log);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Запись обслуживания {LogId} для двигателя {MotorId} удалена", logId, motorId);
    }

    /// <inheritdoc />
    public async Task UpdateLocationHistoryAsync(int motorId, int locationHistoryId, UpdateLocationHistoryDto dto)
    {
        _logger.LogInformation("Обновление записи истории перемещений {LocationHistoryId} для двигателя {MotorId}", locationHistoryId, motorId);

        var motor = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с Id {motorId} не найден");

        var locationHistory = await _unitOfWork.LocationHistories.GetByIdAsync(locationHistoryId);
        if (locationHistory == null || locationHistory.MotorId != motorId)
            throw new KeyNotFoundException($"Запись истории перемещений с id {locationHistoryId} не найдена для двигателя {motorId}");

        // Проверка: можно редактировать только последнюю запись (самую новую по StartDate)
        var lastRecord = await _unitOfWork.LocationHistories.GetQueryable()
            .Where(l => l.MotorId == motorId)
            .OrderByDescending(l => l.StartDate)
            .FirstOrDefaultAsync();

        if (lastRecord == null || lastRecord.Id != locationHistoryId)
            throw new InvalidOperationException("Редактирование разрешено только для последней записи истории перемещений. " +
                                                "Чтобы изменить более раннюю запись, удалите последующие записи.");

        locationHistory.Location = dto.Location;
        _unitOfWork.LocationHistories.Update(locationHistory);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Запись истории перемещений {LocationHistoryId} для двигателя {MotorId} обновлена", locationHistoryId, motorId);
    }

    /// <inheritdoc />
    public async Task DeleteLocationHistoryAsync(int motorId, int locationHistoryId)
    {
        _logger.LogInformation("Удаление записи истории перемещений {LocationHistoryId} для двигателя {MotorId}", locationHistoryId, motorId);

        var motor = await _unitOfWork.Motors.GetByIdAsync(motorId);
        if (motor == null)
            throw new KeyNotFoundException($"Двигатель с Id {motorId} не найден");

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

        // Удаляем активную (последнюю) запись
        if (locationHistory.EndDate == null)
        {
            if (index > 0)
            {
                var previous = allHistories[index - 1];
                previous.EndDate = null;
                _unitOfWork.LocationHistories.Update(previous);

                // Восстанавливаем статус двигателя из предыдущей записи
                motor.Status = previous.Status;
                _unitOfWork.Motors.Update(motor);
            }
            else
            {
                throw new InvalidOperationException("Нельзя удалить единственную активную запись местоположения – двигатель останется без текущего места");
            }
            _unitOfWork.LocationHistories.Remove(locationHistory);
            await _unitOfWork.SaveChangesAsync();
            _logger.LogInformation("Активная запись истории перемещений {LocationHistoryId} для двигателя {MotorId} удалена, предыдущая запись стала активной со статусом {Status}",
                locationHistoryId, motorId, motor.Status);
            return;
        }

        // Закрытая запись – разрешаем удаление только если она последняя в хронологии
        if (index == allHistories.Count - 1)
        {
            _unitOfWork.LocationHistories.Remove(locationHistory);
            await _unitOfWork.SaveChangesAsync();
            _logger.LogInformation("Закрытая последняя запись истории перемещений {LocationHistoryId} для двигателя {MotorId} удалена", locationHistoryId, motorId);
        }
        else
        {
            throw new InvalidOperationException("Удаление промежуточных записей истории перемещений запрещено, так как это нарушит непрерывность временной линии. Можно отредактировать Location или удалить только последнюю запись.");
        }
    }

    /// <inheritdoc />
    public async Task<PagedResult<MaintenanceReportItemDto>> GetMaintenanceReportPagedAsync(
        DateTime? fromDate,
        DateTime? toDate,
        MaintenanceType? workType,
        int page,
        int pageSize)
    {
        _logger.LogInformation("Формирование отчёта по обслуживанию: период {From} - {To}, тип работ {WorkType}, страница {Page}, размер {PageSize}",
            fromDate, toDate, workType, page, pageSize);

        // Приводим все даты к UTC (требование PostgreSQL для timestamp with time zone)
        if (fromDate.HasValue)
            fromDate = DateTime.SpecifyKind(fromDate.Value, DateTimeKind.Utc);
        if (toDate.HasValue)
            toDate = DateTime.SpecifyKind(toDate.Value, DateTimeKind.Utc);

        // Валидация диапазона дат
        if (fromDate.HasValue && toDate.HasValue && fromDate > toDate)
            throw new ArgumentException("Дата начала периода не может быть позже даты окончания");

        // Базовый запрос с навигационными свойствами
        var query = _unitOfWork.MaintenanceLogs.GetQueryable()
            .Include(m => m.Motor)
                .ThenInclude(motor => motor.LocationHistories)
            .AsQueryable(); // явное приведение к IQueryable для дальнейших Include

        // Добавляем остальные Include (LubricantType, OldBearing, NewBearing)
        query = query.Include(m => m.LubricantType)
                     .Include(m => m.OldBearing)
                     .Include(m => m.NewBearing);

        // Фильтр по датам
        if (fromDate.HasValue)
            query = query.Where(m => m.Date >= fromDate.Value);
        if (toDate.HasValue)
        {
            // Добавляем один день, чтобы включить весь toDate (до 24:00)
            var endDate = toDate.Value.AddDays(1);
            query = query.Where(m => m.Date < endDate);
        }

        // Фильтр по типу работ
        if (workType.HasValue)
            query = query.Where(m => m.WorkType == workType.Value);

        // Общее количество записей (до пагинации)
        var totalCount = await query.CountAsync();

        // Пагинация и проекция
        var items = await query
            .OrderByDescending(m => m.Date)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new MaintenanceReportItemDto
            {
                Id = m.Id,
                Date = m.Date,
                WorkType = m.WorkType.ToString(),
                Comment = m.Comment,
                PerformedBy = m.PerformedBy,
                BearingPosition = m.BearingPosition.HasValue ? m.BearingPosition.Value.ToString() : null,
                LubricantTypeName = m.LubricantType != null ? m.LubricantType.Name : null,
                OldBearing = m.OldBearing != null ? new BearingDto
                {
                    Id = m.OldBearing.Id,
                    Type = m.OldBearing.Type,
                    Manufacturer = m.OldBearing.Manufacturer,
                    Supplier = m.OldBearing.Supplier
                } : null,
                NewBearing = m.NewBearing != null ? new BearingDto
                {
                    Id = m.NewBearing.Id,
                    Type = m.NewBearing.Type,
                    Manufacturer = m.NewBearing.Manufacturer,
                    Supplier = m.NewBearing.Supplier
                } : null,
                MotorId = m.Motor.Id,
                MotorInventoryNumber = m.Motor.InventoryNumber,
                MotorType = m.Motor.Type,
                MotorPower = m.Motor.Power,
                MotorSpeed = m.Motor.Speed,
                MotorMountingType = m.Motor.MountingType.ToString(),
                MotorCurrentLocation = m.Motor.LocationHistories
                    .Where(lh => lh.EndDate == null)
                    .Select(lh => lh.Location)
                    .FirstOrDefault() ?? string.Empty
            })
            .ToListAsync();

        return new PagedResult<MaintenanceReportItemDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }

    /// <inheritdoc />
    public async Task<IEnumerable<MaintenanceReportSummaryDto>> GetMaintenanceReportSummaryAsync(
        DateTime? fromDate,
        DateTime? toDate)
    {
        _logger.LogInformation("Формирование сводки по обслуживанию: период {From} - {To}", fromDate, toDate);

        if (fromDate.HasValue)
            fromDate = DateTime.SpecifyKind(fromDate.Value, DateTimeKind.Utc);
        if (toDate.HasValue)
            toDate = DateTime.SpecifyKind(toDate.Value, DateTimeKind.Utc);

        if (fromDate.HasValue && toDate.HasValue && fromDate > toDate)
            throw new ArgumentException("Дата начала периода не может быть позже даты окончания");

        var query = _unitOfWork.MaintenanceLogs.GetQueryable();

        if (fromDate.HasValue)
            query = query.Where(m => m.Date >= fromDate.Value);
        if (toDate.HasValue)
        {
            var endDate = toDate.Value.AddDays(1);
            query = query.Where(m => m.Date < endDate);
        }

        var summary = await query
            .GroupBy(m => m.WorkType)
            .Select(g => new MaintenanceReportSummaryDto
            {
                WorkType = g.Key.ToString(),
                Count = g.Count()
            })
            .OrderBy(s => s.WorkType)
            .ToListAsync();

        return summary;
    }
}