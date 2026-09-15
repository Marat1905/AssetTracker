using AssetTracker.Application.DTOs;
using AssetTracker.Application.Services;
using AssetTracker.Domain.Entities;
using AssetTracker.Domain.Interfaces;
using AssetTracker.Tests.Helpers;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using System.Linq.Expressions;

namespace AssetTracker.Tests.Unit.Services;

public class LubricantTypeServiceTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<ILubricantTypeRepository> _lubricantTypeRepoMock;
    private readonly Mock<IMaintenanceLogRepository> _maintenanceLogRepoMock;
    private readonly IMapper _mapper;
    private readonly LubricantTypeService _service;

    public LubricantTypeServiceTests()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _lubricantTypeRepoMock = new Mock<ILubricantTypeRepository>();
        _maintenanceLogRepoMock = new Mock<IMaintenanceLogRepository>();

        _unitOfWorkMock.Setup(u => u.LubricantTypes).Returns(_lubricantTypeRepoMock.Object);
        _unitOfWorkMock.Setup(u => u.MaintenanceLogs).Returns(_maintenanceLogRepoMock.Object);

        _mapper = MapperHelper.CreateMapper();
        var logger = new Mock<ILogger<LubricantTypeService>>().Object;
        _service = new LubricantTypeService(_unitOfWorkMock.Object, _mapper, logger);
    }

    private static Mock<DbSet<T>> CreateAsyncMockDbSet<T>(IQueryable<T> data) where T : class
    {
        var mockSet = new Mock<DbSet<T>>();
        mockSet.As<IQueryable<T>>().Setup(m => m.Provider)
            .Returns(new TestAsyncQueryProvider<T>(data.Provider));
        mockSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(data.Expression);
        mockSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(data.ElementType);
        mockSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(data.GetEnumerator());
        mockSet.As<IAsyncEnumerable<T>>()
            .Setup(m => m.GetAsyncEnumerator(It.IsAny<CancellationToken>()))
            .Returns(new TestAsyncEnumerator<T>(data.GetEnumerator()));
        return mockSet;
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllTypes()
    {
        // Arrange
        var types = new List<LubricantType>
        {
            new LubricantType { Id = 1, Name = "Type1" },
            new LubricantType { Id = 2, Name = "Type2" }
        };
        _lubricantTypeRepoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(types);

        // Act
        var result = await _service.GetAllAsync();

        // Assert
        Assert.Equal(2, result.Count());
        Assert.Contains(result, t => t.Name == "Type1");
    }

    [Fact]
    public async Task GetByIdAsync_ExistingId_ShouldReturnDto()
    {
        // Arrange
        var type = new LubricantType { Id = 10, Name = "Graphite" };
        _lubricantTypeRepoMock.Setup(r => r.GetByIdAsync(10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(type);

        // Act
        var result = await _service.GetByIdAsync(10);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(10, result.Id);
        Assert.Equal("Graphite", result.Name);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingId_ShouldReturnNull()
    {
        // Arrange
        _lubricantTypeRepoMock.Setup(r => r.GetByIdAsync(99, It.IsAny<CancellationToken>()))
            .ReturnsAsync((LubricantType?)null);

        // Act
        var result = await _service.GetByIdAsync(99);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task CreateAsync_ShouldAddAndReturn()
    {
        // Arrange
        var createDto = new CreateLubricantTypeDto { Name = "NewLube", Description = "Test" };
        _lubricantTypeRepoMock.Setup(r => r.AddAsync(It.IsAny<LubricantType>(), It.IsAny<CancellationToken>()))
            .Callback<LubricantType, CancellationToken>((entity, ct) => entity.Id = 42)
            .Returns(Task.CompletedTask);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _service.CreateAsync(createDto);

        // Assert
        Assert.Equal(42, result.Id);
        Assert.Equal("NewLube", result.Name);
        _lubricantTypeRepoMock.Verify(r => r.AddAsync(It.IsAny<LubricantType>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_ExistingType_ShouldUpdate()
    {
        // Arrange
        var existing = new LubricantType { Id = 5, Name = "OldName", Description = "Old" };
        var updateDto = new UpdateLubricantTypeDto { Name = "NewName", Description = "Updated" };

        _lubricantTypeRepoMock.Setup(r => r.GetByIdAsync(5, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);
        _lubricantTypeRepoMock.Setup(r => r.Update(existing));
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _service.UpdateAsync(5, updateDto);

        // Assert
        Assert.Equal("NewName", result.Name);
        Assert.Equal("Updated", result.Description);
        _lubricantTypeRepoMock.Verify(r => r.Update(existing), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_NonExisting_ShouldThrowKeyNotFoundException()
    {
        // Arrange
        _lubricantTypeRepoMock.Setup(r => r.GetByIdAsync(99, It.IsAny<CancellationToken>()))
            .ReturnsAsync((LubricantType?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateAsync(99, new UpdateLubricantTypeDto()));
    }

    [Fact]
    public async Task DeleteAsync_ExistingAndNotUsed_ShouldDelete()
    {
        // Arrange
        var type = new LubricantType { Id = 7, Name = "DeleteMe" };
        _lubricantTypeRepoMock.Setup(r => r.GetByIdAsync(7, It.IsAny<CancellationToken>()))
            .ReturnsAsync(type);

        var emptyLogs = new List<MaintenanceLog>().AsQueryable();
        var mockLogsDbSet = CreateAsyncMockDbSet(emptyLogs);
        _maintenanceLogRepoMock.Setup(r => r.GetQueryable()).Returns(mockLogsDbSet.Object);

        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        await _service.DeleteAsync(7);

        // Assert
        _lubricantTypeRepoMock.Verify(r => r.Remove(type), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_UsedInMaintenance_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var type = new LubricantType { Id = 8 };
        _lubricantTypeRepoMock.Setup(r => r.GetByIdAsync(8, It.IsAny<CancellationToken>()))
            .ReturnsAsync(type);

        var logs = new List<MaintenanceLog> { new MaintenanceLog { LubricantTypeId = 8 } }.AsQueryable();
        var mockLogsDbSet = CreateAsyncMockDbSet(logs);
        _maintenanceLogRepoMock.Setup(r => r.GetQueryable()).Returns(mockLogsDbSet.Object);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteAsync(8));
    }
}