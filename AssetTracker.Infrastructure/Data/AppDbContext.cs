using AssetTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AssetTracker.Infrastructure.Data;

/// <summary>
/// Контекст базы данных для AssetTracker.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    /// <summary>Электродвигатели.</summary>
    public DbSet<Motor> Motors { get; set; }

    /// <summary>История перемещений.</summary>
    public DbSet<LocationHistory> LocationHistories { get; set; }

    /// <summary>Журнал обслуживания.</summary>
    public DbSet<MaintenanceLog> MaintenanceLogs { get; set; }

    /// <summary>Типы смазки.</summary>
    public DbSet<LubricantType> LubricantTypes { get; set; }

    /// <summary>Подшипники.</summary>
    public DbSet<Bearing> Bearings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Motor>(entity =>
        {
            entity.HasKey(e => e.InventoryNumber);
            entity.Property(e => e.InventoryNumber).ValueGeneratedNever();
            entity.Property(e => e.Type).IsRequired().HasMaxLength(100);
            entity.Property(e => e.ShaftDiameter).HasPrecision(10, 2);
            entity.Property(e => e.Power).HasPrecision(10, 2);
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.MountingType)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            entity.HasOne(e => e.FrontBearing)
                .WithMany()
                .HasForeignKey(e => e.FrontBearingId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.RearBearing)
                .WithMany()
                .HasForeignKey(e => e.RearBearingId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<LocationHistory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Location).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Status).HasConversion<string>();

            entity.HasOne(e => e.Motor)
                  .WithMany(m => m.LocationHistories)
                  .HasForeignKey(e => e.MotorId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MaintenanceLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.WorkType).HasConversion<string>();
            entity.Property(e => e.Comment).HasMaxLength(500);
            entity.Property(e => e.BearingPosition)
                .HasConversion<string>()
                .IsRequired(false);

            entity.Property(e => e.PerformedBy)
                .IsRequired()
                .HasMaxLength(100);

            entity.HasOne(e => e.OldBearing)
                .WithMany()
                .HasForeignKey(e => e.OldBearingId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.NewBearing)
                .WithMany()
                .HasForeignKey(e => e.NewBearingId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Motor)
                  .WithMany(m => m.MaintenanceLogs)
                  .HasForeignKey(e => e.MotorId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.LubricantType)
                  .WithMany()
                  .HasForeignKey(e => e.LubricantTypeId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(m => new { m.MotorId, m.WorkType, m.BearingPosition, m.Date })
                .HasDatabaseName("IX_MaintenanceLogs_LastLubricant");
        });

        modelBuilder.Entity<LubricantType>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
        });

        modelBuilder.Entity<Bearing>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Manufacturer).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Supplier).IsRequired().HasMaxLength(200);
        });
    }
}