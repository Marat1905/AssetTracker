namespace AssetTracker.Domain.Enums;

/// <summary>
/// Тип монтажа (крепления) электродвигателя.
/// </summary>
public enum MountingType
{
    /// <summary>Лапы.</summary>
    Feet,

    /// <summary>Лапы и фланец (комбинированный).</summary>
    FeetAndFlange,

    /// <summary>Фланец.</summary>
    Flange,

    /// <summary>Малый фланец.</summary>
    SmallFlange,

    /// <summary>Комбинированный с малым фланцем (лапы + малый фланец).</summary>
    FeetAndSmallFlange
}