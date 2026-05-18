using AssetTracker.Application.DTOs;
using FluentValidation;

namespace AssetTracker.Application.Validators;

public class UpdateMotorDtoValidator : AbstractValidator<UpdateMotorDto>
{
    public UpdateMotorDtoValidator()
    {
        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("Тип двигателя обязателен")
            .MaximumLength(100);

        RuleFor(x => x.ShaftDiameter)
            .GreaterThan(0).WithMessage("Диаметр вала должен быть больше 0 мм");

        RuleFor(x => x.Power)
            .GreaterThan(0).WithMessage("Мощность должна быть больше 0");

        RuleFor(x => x.Speed)
            .GreaterThan(0).WithMessage("Обороты должны быть больше 0");

        RuleFor(x => x.MountingType)
            .IsInEnum().WithMessage("Укажите корректный тип монтажа");

        // Если переданы данные переднего подшипника – валидируем
        When(x => x.FrontBearing != null, () =>
        {
            RuleFor(x => x.FrontBearing!.Type).NotEmpty().WithMessage("Тип переднего подшипника обязателен");
            RuleFor(x => x.FrontBearing!.Manufacturer).NotEmpty().WithMessage("Производитель переднего подшипника обязателен");
            RuleFor(x => x.FrontBearing!.Supplier).NotEmpty().WithMessage("Поставщик переднего подшипника обязателен");
        });

        // Если переданы данные заднего подшипника – валидируем
        When(x => x.RearBearing != null, () =>
        {
            RuleFor(x => x.RearBearing!.Type).NotEmpty().WithMessage("Тип заднего подшипника обязателен");
            RuleFor(x => x.RearBearing!.Manufacturer).NotEmpty().WithMessage("Производитель заднего подшипника обязателен");
            RuleFor(x => x.RearBearing!.Supplier).NotEmpty().WithMessage("Поставщик заднего подшипника обязателен");
        });
    }
}