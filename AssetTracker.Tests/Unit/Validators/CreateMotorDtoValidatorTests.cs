using FluentValidation.TestHelper;
using AssetTracker.Application.DTOs;
using AssetTracker.Application.Validators;
using AssetTracker.Domain.Enums;

namespace AssetTracker.Tests.Unit.Validators;

public class CreateMotorDtoValidatorTests
{
    private readonly CreateMotorDtoValidator _validator;

    public CreateMotorDtoValidatorTests()
    {
        _validator = new CreateMotorDtoValidator();
    }

    [Fact]
    public void ValidDto_ShouldNotHaveErrors()
    {
        var dto = new CreateMotorDto
        {
            InventoryNumber = 100,
            Type = "AИР112M4",
            ShaftDiameter = 28,
            Power = 7.5,
            Speed = 1500,
            InitialLocation = "Цех 3",
            MountingType = MountingType.Feet,
            FrontBearing = new CreateBearingDto { Type = "6205", Manufacturer = "SKF", Supplier = "OOO" },
            RearBearing = new CreateBearingDto { Type = "6205", Manufacturer = "SKF", Supplier = "OOO" }
        };

        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void InventoryNumber_ZeroOrNegative_ShouldHaveError()
    {
        var dto = new CreateMotorDto { InventoryNumber = 0 };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.InventoryNumber);
    }

    [Fact]
    public void Type_Empty_ShouldHaveError()
    {
        var dto = new CreateMotorDto { Type = "" };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.Type);
    }

    [Fact]
    public void ShaftDiameter_Zero_ShouldHaveError()
    {
        var dto = new CreateMotorDto { ShaftDiameter = 0 };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.ShaftDiameter);
    }

    [Fact]
    public void Power_Negative_ShouldHaveError()
    {
        var dto = new CreateMotorDto { Power = -1 };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.Power);
    }

    [Fact]
    public void InitialLocation_Empty_ShouldHaveError()
    {
        var dto = new CreateMotorDto { InitialLocation = "" };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.InitialLocation);
    }

    [Fact]
    public void FrontBearing_Null_ShouldHaveError()
    {
        var dto = new CreateMotorDto { FrontBearing = null! };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.FrontBearing);
    }

    [Fact]
    public void FrontBearing_EmptyType_ShouldHaveError()
    {
        var dto = new CreateMotorDto
        {
            FrontBearing = new CreateBearingDto { Type = "", Manufacturer = "M", Supplier = "S" }
        };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.FrontBearing.Type);
    }

    [Fact]
    public void MountingType_InvalidEnum_ShouldHaveError()
    {
        var dto = new CreateMotorDto { MountingType = (MountingType)999 };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.MountingType);
    }
}