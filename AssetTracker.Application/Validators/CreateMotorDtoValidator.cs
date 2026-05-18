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

        // Проверяем, что если указан ID подшипника, то он должен быть > 0 (существование проверит сервис)
        RuleFor(x => x.FrontBearingId)
            .GreaterThan(0).When(x => x.FrontBearingId.HasValue)
            .WithMessage("ID переднего подшипника должен быть положительным");

        RuleFor(x => x.RearBearingId)
            .GreaterThan(0).When(x => x.RearBearingId.HasValue)
            .WithMessage("ID заднего подшипника должен быть положительным");

        RuleFor(x => x.InitialLocation)
            .NotEmpty().WithMessage("Начальное место установки обязательно");

        RuleFor(x => x.MountingType)
            .IsInEnum().WithMessage("Укажите корректный тип монтажа: Feet, Flange, FeetAndFlange, SmallFlange, FeetAndSmallFlange");
    }
}