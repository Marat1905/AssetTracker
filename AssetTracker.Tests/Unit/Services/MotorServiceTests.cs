using AssetTracker.Application.DTOs;
using AssetTracker.Application.Services;
using AssetTracker.Domain.Entities;
using AssetTracker.Domain.Enums;
using AssetTracker.Domain.Interfaces;
using AssetTracker.Tests.Helpers;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using System.Linq.Expressions;

namespace AssetTracker.Tests.Unit.Services;

public class MotorServiceTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IMotorRepository> _motorRepoMock;
    private readonly Mock<ILocationHistoryRepository> _locationHistoryRepoMock;
    private readonly Mock<IMaintenanceLogRepository> _maintenanceLogRepoMock;
    private readonly Mock<ILubricantTypeRepository> _lubricantTypeRepoMock;
    private readonly Mock<IBearingRepository> _bearingRepoMock;
    private readonly IMapper _mapper;
    private readonly MotorService _service;

    public MotorServiceTests()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _motorRepoMock = new Mock<IMotorRepository>();
        _locationHistoryRepoMock = new Mock<ILocationHistoryRepository>();
        _maintenanceLogRepoMock = new Mock<IMaintenanceLogRepository>();
        _lubricantTypeRepoMock = new Mock<ILubricantTypeRepository>();
        _bearingRepoMock = new Mock<IBearingRepository>();

        _unitOfWorkMock.Setup(u => u.Motors).Returns(_motorRepoMock.Object);
        _unitOfWorkMock.Setup(u => u.LocationHistories).Returns(_locationHistoryRepoMock.Object);
        _unitOfWorkMock.Setup(u => u.MaintenanceLogs).Returns(_maintenanceLogRepoMock.Object);
        _unitOfWorkMock.Setup(u => u.LubricantTypes).Returns(_lubricantTypeRepoMock.Object);
        _unitOfWorkMock.Setup(u => u.Bearings).Returns(_bearingRepoMock.Object);

        _mapper = MapperHelper.CreateMapper();
        var logger = new Mock<ILogger<MotorService>>().Object;
        _service = new MotorService(_unitOfWorkMock.Object, _mapper, logger);
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
    public async Task CreateMotorAsync_ValidDto_ShouldCreateMotorAndLocation()
    {
        // Arrange
        var dto = TestDataFactory.CreateValidCreateMotorDto(2001);
        _motorRepoMock.Setup(r => r.GetByIdAsync(dto.InventoryNumber, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Motor?)null);
        _bearingRepoMock.Setup(r => r.AddAsync(It.IsAny<Bearing>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _motorRepoMock.Setup(r => r.AddAsync(It.IsAny<Motor>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _locationHistoryRepoMock.Setup(r => r.AddAsync(It.IsAny<LocationHistory>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var motorQuery = new List<Motor> { new Motor { InventoryNumber = 2001 } }.AsQueryable();
        var motorDbSetMock = CreateAsyncMockDbSet(motorQuery);
        _motorRepoMock.Setup(r => r.GetQueryable()).Returns(motorDbSetMock.Object);

        var locationHistoryQuery = new List<LocationHistory>().AsQueryable();
        var locationDbSetMock = CreateAsyncMockDbSet(locationHistoryQuery);
        _locationHistoryRepoMock.Setup(r => r.GetQueryable()).Returns(locationDbSetMock.Object);

        var maintenanceQuery = new List<MaintenanceLog>().AsQueryable();
        var maintenanceDbSetMock = CreateAsyncMockDbSet(maintenanceQuery);
        _maintenanceLogRepoMock.Setup(r => r.GetQueryable()).Returns(maintenanceDbSetMock.Object);

        // Act
        var result = await _service.CreateMotorAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(dto.InventoryNumber, result.InventoryNumber);
        _bearingRepoMock.Verify(r => r.AddAsync(It.IsAny<Bearing>(), It.IsAny<CancellationToken>()), Times.Exactly(2));
        _motorRepoMock.Verify(r => r.AddAsync(It.IsAny<Motor>(), It.IsAny<CancellationToken>()), Times.Once);
        _locationHistoryRepoMock.Verify(r => r.AddAsync(It.IsAny<LocationHistory>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Exactly(3));
    }

    [Fact]
    public async Task CreateMotorAsync_DuplicateInventoryNumber_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var dto = TestDataFactory.CreateValidCreateMotorDto(2002);
        var existingMotor = new Motor { InventoryNumber = 2002 };
        _motorRepoMock.Setup(r => r.GetByIdAsync(dto.InventoryNumber, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingMotor);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateMotorAsync(dto));
    }

    [Fact]
    public async Task MoveMotorAsync_ValidMove_ShouldCloseActiveAndCreateNewLocation()
    {
        // Arrange
        int motorId = 3001;
        var motor = new Motor { InventoryNumber = motorId, Status = MotorStatus.InOperation };
        var activeLocation = new LocationHistory
        {
            MotorId = motorId,
            Location = "Old Location",
            StartDate = DateTime.UtcNow.AddDays(-10),
            EndDate = null,
            Status = MotorStatus.InOperation
        };

        _motorRepoMock.Setup(r => r.GetByIdAsync(motorId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(motor);
        _locationHistoryRepoMock.Setup(r => r.GetActiveLocationAsync(motorId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(activeLocation);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var moveDto = new MoveMotorDto { NewLocation = "New Location", NewStatus = MotorStatus.Reserve };

        // Act
        await _service.MoveMotorAsync(motorId, moveDto);

        // Assert
        Assert.Equal(MotorStatus.Reserve, motor.Status);
        Assert.NotNull(activeLocation.EndDate);
        _locationHistoryRepoMock.Verify(r => r.AddAsync(It.IsAny<LocationHistory>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task MoveMotorAsync_NonExistingMotor_ShouldThrowKeyNotFoundException()
    {
        // Arrange
        _motorRepoMock.Setup(r => r.GetByIdAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Motor?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.MoveMotorAsync(999, new MoveMotorDto()));
    }

    [Fact]
    public async Task AddMaintenanceAsync_Lubrication_ShouldAddLog()
    {
        // Arrange
        int motorId = 4001;
        var motor = new Motor { InventoryNumber = motorId };
        var dto = TestDataFactory.CreateLubricationDto(5, BearingPosition.Rear);

        _motorRepoMock.Setup(r => r.GetByIdAsync(motorId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(motor);
        _lubricantTypeRepoMock.Setup(r => r.ExistsAsync(5, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _maintenanceLogRepoMock.Setup(r => r.AddAsync(It.IsAny<MaintenanceLog>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        await _service.AddMaintenanceAsync(motorId, dto);

        // Assert
        _maintenanceLogRepoMock.Verify(r => r.AddAsync(It.Is<MaintenanceLog>(log =>
            log.WorkType == MaintenanceType.Lubrication &&
            log.BearingPosition == BearingPosition.Rear &&
            log.LubricantTypeId == 5), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task AddMaintenanceAsync_Lubrication_InvalidLubricantType_ShouldThrowArgumentException()
    {
        // Arrange
        var dto = TestDataFactory.CreateLubricationDto(999, BearingPosition.Front);
        _motorRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Motor());
        _lubricantTypeRepoMock.Setup(r => r.ExistsAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => _service.AddMaintenanceAsync(1, dto));
    }

    [Fact]
    public async Task GetFullHistoryAsync_ExistingMotor_ShouldReturnDtoWithHistory()
    {
        // Arrange
        int motorId = 5001;
        var motor = new Motor
        {
            InventoryNumber = motorId,
            Type = "TestMotor",
            Status = MotorStatus.InOperation,
            FrontBearing = new Bearing { Id = 1, Type = "6204", Manufacturer = "SKF", Supplier = "A" },
            RearBearing = new Bearing { Id = 2, Type = "6204", Manufacturer = "SKF", Supplier = "A" }
        };

        var motorQuery = new List<Motor> { motor }.AsQueryable();
        var motorDbSetMock = CreateAsyncMockDbSet(motorQuery);
        _motorRepoMock.Setup(r => r.GetQueryable()).Returns(motorDbSetMock.Object);

        // Важно: установить MotorId для каждой записи
        var locations = new List<LocationHistory>
        {
            new LocationHistory { Id = 1, MotorId = motorId, Location = "Place A", StartDate = DateTime.UtcNow, EndDate = null, Status = MotorStatus.InOperation }
        }.AsQueryable();
        var locationDbSetMock = CreateAsyncMockDbSet(locations);
        _locationHistoryRepoMock.Setup(r => r.GetQueryable()).Returns(locationDbSetMock.Object);

        var logs = new List<MaintenanceLog>
        {
            new MaintenanceLog { Id = 1, MotorId = motorId, WorkType = MaintenanceType.Lubrication, Date = DateTime.UtcNow, PerformedBy = "Tester" }
        }.AsQueryable();
        var logDbSetMock = CreateAsyncMockDbSet(logs);
        _maintenanceLogRepoMock.Setup(r => r.GetQueryable()).Returns(logDbSetMock.Object);

        // Act
        var result = await _service.GetFullHistoryAsync(motorId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(motorId, result.InventoryNumber);
        Assert.Single(result.LocationHistory);
        Assert.Single(result.MaintenanceLogs);
    }

    [Fact]
    public async Task DeleteMotorAsync_ExistingMotor_ShouldRemove()
    {
        // Arrange
        int motorId = 6001;
        var motor = new Motor { InventoryNumber = motorId };
        _motorRepoMock.Setup(r => r.GetByIdAsync(motorId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(motor);
        _motorRepoMock.Setup(r => r.Remove(motor)).Verifiable();
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        await _service.DeleteMotorAsync(motorId);

        // Assert
        _motorRepoMock.Verify(r => r.Remove(motor), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}