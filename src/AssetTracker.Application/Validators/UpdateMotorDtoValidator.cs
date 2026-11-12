using AssetTracker.Application.DTOs;
using FluentValidation;

namespace AssetTracker.Application.Validators;

/// <summary>
/// Валидатор для DTO обновления характеристик двигателя.
/// Диаметр вала необязателен.
/// Мощность может быть меньше 0.1 кВт (например, 0.05) — ограничение только > 0.
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

        // Мощность: строго больше 0. Малые значения (0.001, 0.05) допустимы.
        RuleFor(x => x.Power)
            .GreaterThan(0).WithMessage("Мощность должна быть больше 0");

        RuleFor(x => x.Speed)
            .GreaterThan(0).WithMessage("Обороты должны быть больше 0");

        // Комментарий необязателен, но если задан — до 1000 символов
        RuleFor(x => x.Comment)
            .MaximumLength(1000).WithMessage("Комментарий не должен превышать 1000 символов");

        RuleFor(x => x.MountingType)
            .IsInEnum().WithMessage("Укажите корректный тип монтажа: Feet, Flange, FeetAndFlange, SmallFlange, FeetAndSmallFlange");
    }
}