using AssetTracker.Domain.Enums;

namespace AssetTracker.Application.DTOs;

/// <summary>
/// DTO для создания нового электродвигателя.
/// </summary>
public class CreateMotorDto
{
    /// <summary>Инвентарный номер (опциональный, уникальный).</summary>
    public string? InventoryNumber { get; set; }

    /// <summary>Тип двигателя (марка, модель).</summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>Диаметр вала (мм).</summary>
    public double ShaftDiameter { get; set; }

    /// <summary>Мощность (кВт).</summary>
    public double Power { get; set; }

    /// <summary>Обороты (об/мин).</summary>
    public int Speed { get; set; }

    /// <summary>Данные переднего подшипника.</summary>
    public CreateBearingDto FrontBearing { get; set; } = new CreateBearingDto();

    /// <summary>Данные заднего подшипника.</summary>
    public CreateBearingDto RearBearing { get; set; } = new CreateBearingDto();

    /// <summary>Начальный статус двигателя.</summary>
    public MotorStatus Status { get; set; } = MotorStatus.InOperation;

    /// <summary>Начальное место установки.</summary>
    public string InitialLocation { get; set; } = string.Empty;

    /// <summary>Тип монтажа.</summary>
    public MountingType MountingType { get; set; }
}

/// <summary>
/// DTO для обновления основных характеристик двигателя.
/// </summary>
public class UpdateMotorDto
{
    /// <summary>Тип двигателя.</summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>Диаметр вала (мм).</summary>
    public double ShaftDiameter { get; set; }

    /// <summary>Мощность (кВт).</summary>
    public double Power { get; set; }

    /// <summary>Обороты (об/мин).</summary>
    public int Speed { get; set; }

    /// <summary>Статус двигателя.</summary>
    public MotorStatus Status { get; set; }

    /// <summary>Тип монтажа.</summary>
    public MountingType MountingType { get; set; }
}

/// <summary>
/// DTO для перемещения двигателя.
/// </summary>
public class MoveMotorDto
{
    /// <summary>Новое местоположение.</summary>
    public string NewLocation { get; set; } = string.Empty;

    /// <summary>Новый статус (опционально).</summary>
    public MotorStatus? NewStatus { get; set; }
}

/// <summary>
/// DTO для установки/изменения инвентарного номера двигателя.
/// </summary>
public class SetInventoryNumberDto
{
    /// <summary>Новый инвентарный номер (должен быть уникальным, если не null).</summary>
    public string? InventoryNumber { get; set; }
}