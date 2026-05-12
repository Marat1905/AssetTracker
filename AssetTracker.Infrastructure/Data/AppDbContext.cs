using AssetTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AssetTracker.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Motor> Motors { get; set; }
    public DbSet<LocationHistory> LocationHistories { get; set; }
    public DbSet<MaintenanceLog> MaintenanceLogs { get; set; }

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

            // Конфигурация для нового поля MountingType – хранить как строку (значение enum)
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
            entity.HasOne(e => e.Motor)
                  .WithMany(m => m.MaintenanceLogs)
                  .HasForeignKey(e => e.MotorId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}