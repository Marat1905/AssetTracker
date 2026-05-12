namespace AssetTracker.Domain.Enums;

/// <summary>
/// Тип монтажа (крепления) электродвигателя
/// </summary>
public enum MountingType
{
    /// <summary>Лапы</summary>
    Feet,

    /// <summary>Лапы и фланец</summary>
    FeetAndFlange,

    /// <summary>Фланец</summary>
    Flange
}