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
    public void ValidDto_WithInventoryNumber_ShouldNotHaveErrors()
    {
        var dto = new CreateMotorDto
        {
            InventoryNumber = "100",
            Type = "АИР112M4",
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
    public void ValidDto_WithoutInventoryNumber_ShouldNotHaveErrors()
    {
        var dto = new CreateMotorDto
        {
            InventoryNumber = null,
            Type = "АИР112M4",
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
    public void InventoryNumber_Null_ShouldBeValid()
    {
        var dto = new CreateMotorDto { InventoryNumber = null };
        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveValidationErrorFor(x => x.InventoryNumber);
    }

    [Fact]
    public void InventoryNumber_EmptyString_ShouldHaveError()
    {
        var dto = new CreateMotorDto { InventoryNumber = "" };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.InventoryNumber);
    }

    [Fact]
    public void InventoryNumber_Whitespace_ShouldHaveError()
    {
        var dto = new CreateMotorDto { InventoryNumber = "   " };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.InventoryNumber);
    }

    [Fact]
    public void InventoryNumber_TooLong_ShouldHaveError()
    {
        var dto = new CreateMotorDto { InventoryNumber = new string('A', 51) };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.InventoryNumber);
    }

    [Fact]
    public void InventoryNumber_WithValidCharacters_ShouldBeValid()
    {
        var validNumbers = new[] { "ABC-123", "456_789", "123/456", "789.123", "A1B2C3" };
        foreach (var inv in validNumbers)
        {
            var dto = new CreateMotorDto { InventoryNumber = inv };
            var result = _validator.TestValidate(dto);
            result.ShouldNotHaveValidationErrorFor(x => x.InventoryNumber);
        }
    }

    [Fact]
    public void InventoryNumber_WithInvalidCharacters_ShouldHaveError()
    {
        var invalidNumbers = new[] { "123!", "@ABC", "123#", "123$", "123%" };
        foreach (var inv in invalidNumbers)
        {
            var dto = new CreateMotorDto { InventoryNumber = inv };
            var result = _validator.TestValidate(dto);
            result.ShouldHaveValidationErrorFor(x => x.InventoryNumber);
        }
    }

    [Fact]
    public void Type_Empty_ShouldHaveError()
    {
        var dto = new CreateMotorDto { Type = "" };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.Type);
    }

    [Fact]
    public void Type_Null_ShouldHaveError()
    {
        var dto = new CreateMotorDto { Type = null! };
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
    public void ShaftDiameter_Negative_ShouldHaveError()
    {
        var dto = new CreateMotorDto { ShaftDiameter = -5 };
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
    public void Power_Zero_ShouldHaveError()
    {
        var dto = new CreateMotorDto { Power = 0 };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.Power);
    }

    [Fact]
    public void Speed_Zero_ShouldHaveError()
    {
        var dto = new CreateMotorDto { Speed = 0 };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.Speed);
    }

    [Fact]
    public void Speed_Negative_ShouldHaveError()
    {
        var dto = new CreateMotorDto { Speed = -100 };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.Speed);
    }

    [Fact]
    public void InitialLocation_Empty_ShouldHaveError()
    {
        var dto = new CreateMotorDto { InitialLocation = "" };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.InitialLocation);
    }

    [Fact]
    public void InitialLocation_Null_ShouldHaveError()
    {
        var dto = new CreateMotorDto { InitialLocation = null! };
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
    public void FrontBearing_EmptyManufacturer_ShouldHaveError()
    {
        var dto = new CreateMotorDto
        {
            FrontBearing = new CreateBearingDto { Type = "6205", Manufacturer = "", Supplier = "S" }
        };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.FrontBearing.Manufacturer);
    }

    [Fact]
    public void FrontBearing_EmptySupplier_ShouldHaveError()
    {
        var dto = new CreateMotorDto
        {
            FrontBearing = new CreateBearingDto { Type = "6205", Manufacturer = "M", Supplier = "" }
        };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.FrontBearing.Supplier);
    }

    [Fact]
    public void RearBearing_Null_ShouldHaveError()
    {
        var dto = new CreateMotorDto { RearBearing = null! };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.RearBearing);
    }

    [Fact]
    public void MountingType_InvalidEnum_ShouldHaveError()
    {
        var dto = new CreateMotorDto { MountingType = (MountingType)999 };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.MountingType);
    }
}