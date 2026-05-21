namespace AssetTracker.Domain.Enums;

/// <summary>
/// Статус электродвигателя.
/// </summary>
public enum MotorStatus
{
    /// <summary>В эксплуатации.</summary>
    InOperation,

    /// <summary>Резерв.</summary>
    Reserve,

    /// <summary>Ремонт.</summary>
    Repair,

    /// <summary>Списан.</summary>
    Scrapped
}