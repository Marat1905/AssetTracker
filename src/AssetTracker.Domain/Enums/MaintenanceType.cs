namespace AssetTracker.Domain.Enums;

/// <summary>
/// Тип выполненной работы по обслуживанию.
/// </summary>
public enum MaintenanceType
{
    /// <summary>Смазка подшипников.</summary>
    Lubrication,

    /// <summary>Замена подшипника.</summary>
    BearingReplacement,

    /// <summary>Перемотка статора.</summary>
    StatorRewinding,

    /// <summary>Ремонт вала.</summary>
    ShaftRepair
}