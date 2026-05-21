namespace AssetTracker.Application.DTOs;

/// <summary>
/// DTO для чтения типа смазки.
/// </summary>
public class LubricantTypeDto
{
    /// <summary>Идентификатор.</summary>
    public int Id { get; set; }

    /// <summary>Название.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Описание.</summary>
    public string? Description { get; set; }
}

/// <summary>
/// DTO для создания типа смазки.
/// </summary>
public class CreateLubricantTypeDto
{
    /// <summary>Название.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Описание.</summary>
    public string? Description { get; set; }
}

/// <summary>
/// DTO для обновления типа смазки.
/// </summary>
public class UpdateLubricantTypeDto
{
    /// <summary>Название.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Описание.</summary>
    public string? Description { get; set; }
}