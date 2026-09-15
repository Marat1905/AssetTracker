using AssetTracker.Application.DTOs;
using FluentValidation;

namespace AssetTracker.Application.Validators;

/// <summary>
/// Валидатор для DTO перемещения двигателя.
/// </summary>
public class MoveMotorDtoValidator : AbstractValidator<MoveMotorDto>
{
    public MoveMotorDtoValidator()
    {
        RuleFor(x => x.NewLocation)
            .NotEmpty().WithMessage("Новое место установки не может быть пустым");
    }
}