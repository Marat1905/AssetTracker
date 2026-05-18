using AssetTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AssetTracker.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Motor> Motors { get; set; }
    public DbSet<LocationHistory> LocationHistories { get; set; }
    public DbSet<MaintenanceLog> MaintenanceLogs { get; set; }
    public DbSet<LubricantType> LubricantTypes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Motor>(entity =>
        {
            entity.HasKey(e => e.InventoryNumber);
            entity.Property(e => e.InventoryNumber).ValueGeneratedNever();
            entity.Property(e => e.Type).IsRequired().HasMaxLength(100);
            entity.Property(e => e.ShaftDiameter).HasPrecision(10, 2);
            entity.Property(e => e.Power).HasPrecision(10, 2);
            entity.Property(e => e.FrontBearingType).HasMaxLength(50);
            entity.Property(e => e.RearBearingType).HasMaxLength(50);
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.MountingType)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();
        });

        modelBuilder.Entity<LocationHistory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Location).IsRequired().HasMaxLength(200);
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

            // Новые поля для замены подшипника
            entity.Property(e => e.OldBearingType)
                .HasMaxLength(100)
                .IsRequired(false);

            entity.Property(e => e.NewBearingType)
                .HasMaxLength(100)
                .IsRequired(false);

            entity.HasOne(e => e.Motor)
                  .WithMany(m => m.MaintenanceLogs)
                  .HasForeignKey(e => e.MotorId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.LubricantType)
                  .WithMany()
                  .HasForeignKey(e => e.LubricantTypeId)
                  .OnDelete(DeleteBehavior.Restrict);

            // Составной индекс для ускорения запросов последней смазки
            entity.HasIndex(m => new { m.MotorId, m.WorkType, m.BearingPosition, m.Date })
                .HasDatabaseName("IX_MaintenanceLogs_LastLubricant");
        });

        modelBuilder.Entity<LubricantType>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
        });
    }
}