using FluentValidation.TestHelper;
using AssetTracker.Application.DTOs;
using AssetTracker.Application.Validators;

namespace AssetTracker.Tests.Unit.Validators;

public class MoveMotorDtoValidatorTests
{
    private readonly MoveMotorDtoValidator _validator;

    public MoveMotorDtoValidatorTests()
    {
        _validator = new MoveMotorDtoValidator();
    }

    [Fact]
    public void ValidDto_ShouldNotHaveErrors()
    {
        var dto = new MoveMotorDto { NewLocation = "Цех №5" };
        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void NewLocation_Empty_ShouldHaveError()
    {
        var dto = new MoveMotorDto { NewLocation = "" };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.NewLocation);
    }

    [Fact]
    public void NewLocation_Whitespace_ShouldHaveError()
    {
        var dto = new MoveMotorDto { NewLocation = "   " };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.NewLocation);
    }
}