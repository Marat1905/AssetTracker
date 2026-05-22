using FluentValidation.TestHelper;
using AssetTracker.Application.DTOs;
using AssetTracker.Application.Validators;
using AssetTracker.Domain.Enums;

namespace AssetTracker.Tests.Unit.Validators;

public class MaintenanceDtoValidatorTests
{
    private readonly MaintenanceDtoValidator _validator;

    public MaintenanceDtoValidatorTests()
    {
        _validator = new MaintenanceDtoValidator();
    }

    [Fact]
    public void Lubrication_Valid_ShouldNotHaveErrors()
    {
        var dto = new MaintenanceDto
        {
            WorkType = MaintenanceType.Lubrication,
            PerformedBy = "Ivanov",
            BearingPosition = BearingPosition.Front,
            LubricantTypeId = 1
        };
        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Lubrication_MissingBearingPosition_ShouldHaveError()
    {
        var dto = new MaintenanceDto
        {
            WorkType = MaintenanceType.Lubrication,
            PerformedBy = "Ivanov",
            LubricantTypeId = 1
        };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.BearingPosition);
    }

    [Fact]
    public void Lubrication_MissingLubricantTypeId_ShouldHaveError()
    {
        var dto = new MaintenanceDto
        {
            WorkType = MaintenanceType.Lubrication,
            PerformedBy = "Ivanov",
            BearingPosition = BearingPosition.Rear
        };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.LubricantTypeId);
    }

    [Fact]
    public void BearingReplacement_WithNewBearing_Valid_ShouldNotHaveErrors()
    {
        var dto = new MaintenanceDto
        {
            WorkType = MaintenanceType.BearingReplacement,
            PerformedBy = "Petrov",
            BearingPosition = BearingPosition.Front,
            NewBearing = new CreateBearingDto { Type = "6305", Manufacturer = "FAG", Supplier = "Supplier" }
        };
        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void BearingReplacement_WithExistingBearingId_Valid_ShouldNotHaveErrors()
    {
        var dto = new MaintenanceDto
        {
            WorkType = MaintenanceType.BearingReplacement,
            PerformedBy = "Petrov",
            BearingPosition = BearingPosition.Rear,
            ExistingBearingId = 123
        };
        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void BearingReplacement_BothExistingAndNew_ShouldHaveError()
    {
        var dto = new MaintenanceDto
        {
            WorkType = MaintenanceType.BearingReplacement,
            PerformedBy = "Petrov",
            BearingPosition = BearingPosition.Front,
            ExistingBearingId = 1,
            NewBearing = new CreateBearingDto()
        };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x);
    }

    [Fact]
    public void StatorRewinding_ShouldNotHaveBearingFields()
    {
        var dto = new MaintenanceDto
        {
            WorkType = MaintenanceType.StatorRewinding,
            PerformedBy = "Sidorov"
        };
        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();

        // Дополнительно проверяем, что дополнительные поля запрещены
        dto.BearingPosition = BearingPosition.Front;
        result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.BearingPosition);
    }

    [Fact]
    public void PerformedBy_Empty_ShouldHaveError()
    {
        var dto = new MaintenanceDto { WorkType = MaintenanceType.Lubrication, PerformedBy = "" };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.PerformedBy);
    }
}