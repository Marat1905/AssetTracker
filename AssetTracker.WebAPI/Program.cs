using AssetTracker.Application.Interfaces;
using AssetTracker.Application.Services;
using AssetTracker.Application.Validators;
using AssetTracker.Infrastructure.Data;
using AssetTracker.Infrastructure.Extensions;
using AssetTracker.WebAPI.Middleware;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Asset Tracker API", Version = "v1" });
});

// Infrastructure (DB, repositories)
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.Configure<Microsoft.AspNetCore.Mvc.JsonOptions>(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// Application services
builder.Services.AddAutoMapper(cfg => {
    // настройки если нужны
}, AppDomain.CurrentDomain.GetAssemblies());
//builder.Services.AddAutoMapper(Assembly.GetEntryAssembly());
builder.Services.AddScoped<IMotorService, MotorService>();

// FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreateMotorDtoValidator>();

// Logging
builder.Services.AddLogging();

var app = builder.Build();

// Apply migrations in Development mode
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await dbContext.Database.MigrateAsync();
    //dbContext.Database.EnsureCreated();
}

// Middleware
app.UseMiddleware<ErrorHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();