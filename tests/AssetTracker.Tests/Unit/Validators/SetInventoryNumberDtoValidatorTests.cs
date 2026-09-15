using FluentValidation.TestHelper;
using AssetTracker.Application.DTOs;
using AssetTracker.Application.Validators;

namespace AssetTracker.Tests.Unit.Validators;

public class SetInventoryNumberDtoValidatorTests
{
    private readonly SetInventoryNumberDtoValidator _validator;

    public SetInventoryNumberDtoValidatorTests()
    {
        _validator = new SetInventoryNumberDtoValidator();
    }

    [Fact]
    public void ValidDto_WithValidInventoryNumber_ShouldNotHaveErrors()
    {
        var dto = new SetInventoryNumberDto { InventoryNumber = "ABC-123" };
        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void ValidDto_WithNullInventoryNumber_ShouldNotHaveErrors()
    {
        var dto = new SetInventoryNumberDto { InventoryNumber = null };
        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void InventoryNumber_EmptyString_ShouldHaveError()
    {
        var dto = new SetInventoryNumberDto { InventoryNumber = "" };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.InventoryNumber);
    }

    [Fact]
    public void InventoryNumber_Whitespace_ShouldHaveError()
    {
        var dto = new SetInventoryNumberDto { InventoryNumber = "   " };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.InventoryNumber);
    }

    [Fact]
    public void InventoryNumber_TooLong_ShouldHaveError()
    {
        var dto = new SetInventoryNumberDto { InventoryNumber = new string('A', 51) };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.InventoryNumber);
    }

    [Fact]
    public void InventoryNumber_WithValidCharacters_ShouldBeValid()
    {
        var validNumbers = new[] { "ABC-123", "456_789", "123/456", "789.123", "A1B2C3", "123" };
        foreach (var inv in validNumbers)
        {
            var dto = new SetInventoryNumberDto { InventoryNumber = inv };
            var result = _validator.TestValidate(dto);
            result.ShouldNotHaveValidationErrorFor(x => x.InventoryNumber);
        }
    }

    [Fact]
    public void InventoryNumber_WithInvalidCharacters_ShouldHaveError()
    {
        var invalidNumbers = new[] { "123!", "@ABC", "123#", "123$", "123%", "space in", "русский" };
        foreach (var inv in invalidNumbers)
        {
            var dto = new SetInventoryNumberDto { InventoryNumber = inv };
            var result = _validator.TestValidate(dto);
            result.ShouldHaveValidationErrorFor(x => x.InventoryNumber);
        }
    }

    [Fact]
    public void InventoryNumber_ExactlyMaxLength_ShouldBeValid()
    {
        var dto = new SetInventoryNumberDto { InventoryNumber = new string('A', 50) };
        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveValidationErrorFor(x => x.InventoryNumber);
    }
}