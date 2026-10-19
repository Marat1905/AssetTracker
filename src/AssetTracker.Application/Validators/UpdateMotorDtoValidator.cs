using AssetTracker.Application.DTOs;
using FluentValidation;

namespace AssetTracker.Application.Validators;

/// <summary>
/// Валидатор для DTO обновления характеристик двигателя.
/// Диаметр вала необязателен.
/// </summary>
public class UpdateMotorDtoValidator : AbstractValidator<UpdateMotorDto>
{
    public UpdateMotorDtoValidator()
    {
        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("Тип двигателя обязателен")
            .MaximumLength(100);

        // Диаметр вала необязателен, но если задан — должен быть > 0
        RuleFor(x => x.ShaftDiameter)
            .GreaterThan(0).WithMessage("Диаметр вала должен быть больше 0 мм")
            .When(x => x.ShaftDiameter.HasValue);

        RuleFor(x => x.Power)
            .GreaterThan(0).WithMessage("Мощность должна быть больше 0");

        RuleFor(x => x.Speed)
            .GreaterThan(0).WithMessage("Обороты должны быть больше 0");

        RuleFor(x => x.MountingType)
            .IsInEnum().WithMessage("Укажите корректный тип монтажа: Feet, Flange, FeetAndFlange, SmallFlange, FeetAndSmallFlange");
    }
}