using AssetTracker.Application.DTOs;
using FluentValidation;

namespace AssetTracker.Application.Validators
{
    public class CreateMotorDtoValidator : AbstractValidator<CreateMotorDto>
    {
        public CreateMotorDtoValidator()
        {
            RuleFor(x => x.InventoryNumber)
                .GreaterThan(0).WithMessage("Инвентарный номер должен быть положительным");

            RuleFor(x => x.Type)
                .NotEmpty().WithMessage("Тип двигателя обязателен")
                .MaximumLength(100);

            RuleFor(x => x.Dimensions)
                .NotEmpty().WithMessage("Габариты обязательны");

            RuleFor(x => x.Power)
                .GreaterThan(0).WithMessage("Мощность должна быть больше 0");

            RuleFor(x => x.Speed)
                .GreaterThan(0).WithMessage("Обороты должны быть больше 0");

            RuleFor(x => x.FrontBearingType)
                .NotEmpty().WithMessage("Тип переднего подшипника обязателен");

            RuleFor(x => x.RearBearingType)
                .NotEmpty().WithMessage("Тип заднего подшипника обязателен");

            RuleFor(x => x.InitialLocation)
                .NotEmpty().WithMessage("Начальное место установки обязательно");
        }
    }
}
