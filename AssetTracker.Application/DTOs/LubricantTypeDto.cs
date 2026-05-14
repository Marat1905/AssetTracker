namespace AssetTracker.Application.DTOs;

public class LubricantTypeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class CreateLubricantTypeDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class UpdateLubricantTypeDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}