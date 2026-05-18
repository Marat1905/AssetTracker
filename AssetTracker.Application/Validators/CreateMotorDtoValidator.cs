using AssetTracker.Application.DTOs;
using FluentValidation;

namespace AssetTracker.Application.Validators;

public class CreateMotorDtoValidator : AbstractValidator<CreateMotorDto>
{
    public CreateMotorDtoValidator()
    {
        RuleFor(x => x.InventoryNumber)
            .GreaterThan(0).WithMessage("Инвентарный номер должен быть положительным");

        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("Тип двигателя обязателен")
            .MaximumLength(100);

        RuleFor(x => x.ShaftDiameter)
            .GreaterThan(0).WithMessage("Диаметр вала должен быть больше 0 мм");

        RuleFor(x => x.Power)
            .GreaterThan(0).WithMessage("Мощность должна быть больше 0");

        RuleFor(x => x.Speed)
            .GreaterThan(0).WithMessage("Обороты должны быть больше 0");

        RuleFor(x => x.InitialLocation)
            .NotEmpty().WithMessage("Начальное место установки обязательно");

        RuleFor(x => x.MountingType)
            .IsInEnum().WithMessage("Укажите корректный тип монтажа");

        // Валидация переднего подшипника
        RuleFor(x => x.FrontBearing)
            .NotNull().WithMessage("Необходимо указать передний подшипник")
            .ChildRules(bearing =>
            {
                bearing.RuleFor(b => b.Type).NotEmpty().WithMessage("Тип переднего подшипника обязателен");
                bearing.RuleFor(b => b.Manufacturer).NotEmpty().WithMessage("Производитель переднего подшипника обязателен");
                bearing.RuleFor(b => b.Supplier).NotEmpty().WithMessage("Поставщик переднего подшипника обязателен");
            });

        // Валидация заднего подшипника
        RuleFor(x => x.RearBearing)
            .NotNull().WithMessage("Необходимо указать задний подшипник")
            .ChildRules(bearing =>
            {
                bearing.RuleFor(b => b.Type).NotEmpty().WithMessage("Тип заднего подшипника обязателен");
                bearing.RuleFor(b => b.Manufacturer).NotEmpty().WithMessage("Производитель заднего подшипника обязателен");
                bearing.RuleFor(b => b.Supplier).NotEmpty().WithMessage("Поставщик заднего подшипника обязателен");
            });
    }
}