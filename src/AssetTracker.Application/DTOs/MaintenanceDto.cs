using AssetTracker.Domain.Enums;

namespace AssetTracker.Application.DTOs;

/// <summary>
/// DTO для добавления записи обслуживания.
/// </summary>
public class MaintenanceDto
{
    /// <summary>Тип выполненной работы.</summary>
    public MaintenanceType WorkType { get; set; }

    /// <summary>Комментарий.</summary>
    public string Comment { get; set; } = string.Empty;

    /// <summary>Кто выполнил обслуживание (обязательное поле).</summary>
    public string PerformedBy { get; set; } = string.Empty;

    /// <summary>Позиция подшипника (для смазки и замены).</summary>
    public BearingPosition? BearingPosition { get; set; }

    /// <summary>Идентификатор типа смазки (для смазки).</summary>
    public int? LubricantTypeId { get; set; }

    /// <summary>Идентификатор существующего подшипника (для замены).</summary>
    public int? ExistingBearingId { get; set; }

    /// <summary>Данные нового подшипника (для замены).</summary>
    public CreateBearingDto? NewBearing { get; set; }
}

/// <summary>
/// DTO для редактирования записи обслуживания.
/// </summary>
public class UpdateMaintenanceLogDto
{
    /// <summary>Новый комментарий (опционально).</summary>
    public string? Comment { get; set; }

    /// <summary>Новый исполнитель (опционально).</summary>
    public string? PerformedBy { get; set; }

    /// <summary>Новый тип смазки (только для смазки).</summary>
    public int? LubricantTypeId { get; set; }

    /// <summary>Существующий подшипник (для замены).</summary>
    public int? ExistingBearingId { get; set; }

    /// <summary>Новый подшипник (для замены).</summary>
    public CreateBearingDto? NewBearing { get; set; }
}

/// <summary>
/// Элемент отчёта по обслуживанию.
/// </summary>
public class MaintenanceReportItemDto
{
    /// <summary>Идентификатор записи обслуживания.</summary>
    public int Id { get; set; }

    /// <summary>Дата выполнения.</summary>
    public DateTime Date { get; set; }

    /// <summary>Тип выполненной работы (строка).</summary>
    public string WorkType { get; set; } = string.Empty;

    /// <summary>Комментарий.</summary>
    public string Comment { get; set; } = string.Empty;

    /// <summary>Исполнитель.</summary>
    public string PerformedBy { get; set; } = string.Empty;

    /// <summary>Позиция подшипника (передний/задний), если применимо.</summary>
    public string? BearingPosition { get; set; }

    /// <summary>Название типа смазки, если применимо.</summary>
    public string? LubricantTypeName { get; set; }

    /// <summary>Старый подшипник (при замене).</summary>
    public BearingDto? OldBearing { get; set; }

    /// <summary>Новый подшипник (при замене).</summary>
    public BearingDto? NewBearing { get; set; }

    // Информация о двигателе
    /// <summary>Идентификатор двигателя.</summary>
    public int MotorId { get; set; }

    /// <summary>Инвентарный номер двигателя (может отсутствовать).</summary>
    public string? MotorInventoryNumber { get; set; }

    /// <summary>Тип/модель двигателя.</summary>
    public string MotorType { get; set; } = string.Empty;

    /// <summary>Мощность двигателя (кВт).</summary>
    public double MotorPower { get; set; }

    /// <summary>Обороты двигателя (об/мин).</summary>
    public int MotorSpeed { get; set; }

    /// <summary>Тип монтажа двигателя (строка).</summary>
    public string MotorMountingType { get; set; } = string.Empty;

    /// <summary>Текущее местоположение двигателя.</summary>
    public string MotorCurrentLocation { get; set; } = string.Empty;
}

/// <summary>
/// Сводка по типам работ за период.
/// </summary>
public class MaintenanceReportSummaryDto
{
    /// <summary>Тип работы (строковое представление).</summary>
    public string WorkType { get; set; } = string.Empty;

    /// <summary>Количество записей обслуживания данного типа.</summary>
    public int Count { get; set; }
}