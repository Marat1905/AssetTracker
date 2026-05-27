using AssetTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AssetTracker.Tests.Helpers;

public static class DatabaseCleaner
{
    public static async Task CleanDatabaseAsync(AppDbContext context)
    {
        await context.Database.ExecuteSqlRawAsync("DELETE FROM \"MaintenanceLogs\";");
        await context.Database.ExecuteSqlRawAsync("DELETE FROM \"LocationHistories\";");
        await context.Database.ExecuteSqlRawAsync("DELETE FROM \"Motors\";");
        await context.Database.ExecuteSqlRawAsync("DELETE FROM \"Bearings\";");
        await context.Database.ExecuteSqlRawAsync("DELETE FROM \"LubricantTypes\";");

        await context.Database.ExecuteSqlRawAsync("ALTER SEQUENCE \"Bearings_Id_seq\" RESTART WITH 1;");
        await context.Database.ExecuteSqlRawAsync("ALTER SEQUENCE \"LubricantTypes_Id_seq\" RESTART WITH 1;");
        await context.Database.ExecuteSqlRawAsync("ALTER SEQUENCE \"LocationHistories_Id_seq\" RESTART WITH 1;");
        await context.Database.ExecuteSqlRawAsync("ALTER SEQUENCE \"MaintenanceLogs_Id_seq\" RESTART WITH 1;");
        await context.Database.ExecuteSqlRawAsync("ALTER SEQUENCE \"Motors_Id_seq\" RESTART WITH 1;");

        foreach (var entry in context.ChangeTracker.Entries())
        {
            entry.State = EntityState.Detached;
        }
    }
}