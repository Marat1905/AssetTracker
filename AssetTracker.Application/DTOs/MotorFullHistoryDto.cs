using AssetTracker.Domain.Enums;

namespace AssetTracker.Application.DTOs;

/// <summary>
/// DTO для полной истории двигателя ("карточка жизни").
/// </summary>
public class MotorFullHistoryDto
{
    /// <summary>Суррогатный идентификатор.</summary>
    public int Id { get; set; }

    /// <summary>Инвентарный номер (может отсутствовать).</summary>
    public string? InventoryNumber { get; set; }

    /// <summary>Тип.</summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>Диаметр вала.</summary>
    public double ShaftDiameter { get; set; }

    /// <summary>Мощность.</summary>
    public double Power { get; set; }

    /// <summary>Обороты.</summary>
    public int Speed { get; set; }

    /// <summary>Передний подшипник.</summary>
    public BearingDto FrontBearing { get; set; } = new BearingDto();

    /// <summary>Задний подшипник.</summary>
    public BearingDto RearBearing { get; set; } = new BearingDto();

    /// <summary>Текущий статус.</summary>
    public MotorStatus Status { get; set; }

    /// <summary>Тип монтажа.</summary>
    public MountingType MountingType { get; set; }

    /// <summary>Последняя использованная смазка для переднего подшипника.</summary>
    public string? FrontBearingLastLubricant { get; set; }

    /// <summary>Последняя использованная смазка для заднего подшипника.</summary>
    public string? RearBearingLastLubricant { get; set; }

    /// <summary>История перемещений.</summary>
    public List<LocationHistoryDto> LocationHistory { get; set; } = new();

    /// <summary>Последние 100 записей обслуживания.</summary>
    public List<MaintenanceLogDto> MaintenanceLogs { get; set; } = new();
}

/// <summary>
/// DTO для записи истории перемещений.
/// </summary>
public class LocationHistoryDto
{
    /// <summary>Идентификатор записи.</summary>
    public int Id { get; set; }

    /// <summary>Местоположение.</summary>
    public string Location { get; set; } = string.Empty;

    /// <summary>Дата начала.</summary>
    public DateTime StartDate { get; set; }

    /// <summary>Дата окончания (null – активная запись).</summary>
    public DateTime? EndDate { get; set; }

    /// <summary>Статус двигателя в этот период.</summary>
    public string Status { get; set; } = string.Empty;
}

/// <summary>
/// DTO для записи журнала обслуживания.
/// </summary>
public class MaintenanceLogDto
{
    /// <summary>Идентификатор записи.</summary>
    public int Id { get; set; }

    /// <summary>Тип работы (строка).</summary>
    public string WorkType { get; set; } = string.Empty;

    /// <summary>Дата выполнения.</summary>
    public DateTime Date { get; set; }

    /// <summary>Комментарий.</summary>
    public string Comment { get; set; } = string.Empty;

    /// <summary>Исполнитель.</summary>
    public string PerformedBy { get; set; } = string.Empty;

    /// <summary>Позиция подшипника (строка).</summary>
    public string? BearingPosition { get; set; }

    /// <summary>Идентификатор типа смазки.</summary>
    public int? LubricantTypeId { get; set; }

    /// <summary>Название типа смазки.</summary>
    public string? LubricantTypeName { get; set; }

    /// <summary>Старый подшипник (при замене).</summary>
    public BearingDto? OldBearing { get; set; }

    /// <summary>Новый подшипник (при замене).</summary>
    public BearingDto? NewBearing { get; set; }
}

/// <summary>
/// DTO для редактирования записи истории перемещений (только изменение места).
/// </summary>
public class UpdateLocationHistoryDto
{
    /// <summary>Новое место расположения.</summary>
    public string Location { get; set; } = string.Empty;
}