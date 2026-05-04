namespace AssetTracker.Domain.Entities;
public class LocationHistory
{
    public int Id { get; set; }
    public int MotorId { get; set; }
    public string Location { get; set; } = string.Empty; // "Цех/Агрегат"
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public virtual Motor Motor { get; set; } = null!;
}
