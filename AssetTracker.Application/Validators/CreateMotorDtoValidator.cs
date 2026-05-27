using AssetTracker.Application.DTOs;
using FluentValidation;

namespace AssetTracker.Application.Validators;

/// <summary>
/// Валидатор для DTO создания двигателя.
/// </summary>
public class CreateMotorDtoValidator : AbstractValidator<CreateMotorDto>
{
    public CreateMotorDtoValidator()
    {
        // Инвентарный номер: null допускается, пустая строка – нет
        RuleFor(x => x.InventoryNumber)
            .MaximumLength(50).WithMessage("Инвентарный номер не должен превышать 50 символов")
            .Matches(@"^[a-zA-Z0-9\-_\/\.]*$").WithMessage("Инвентарный номер может содержать только буквы, цифры и символы - _ / .")
            .When(x => !string.IsNullOrWhiteSpace(x.InventoryNumber));

        RuleFor(x => x.InventoryNumber)
            .Must(inv => inv == null || !string.IsNullOrWhiteSpace(inv))
            .WithMessage("Инвентарный номер не может быть пустой строкой. Используйте null для удаления номера.");

        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("Тип двигателя обязателен")
            .MaximumLength(100);

        RuleFor(x => x.ShaftDiameter)
            .GreaterThan(0).WithMessage("Диаметр вала должен быть больше 0 мм");

        RuleFor(x => x.Power)
            .GreaterThan(0).WithMessage("Мощность должна быть больше 0");

        RuleFor(x => x.Speed)
            .GreaterThan(0).WithMessage("Обороты должны быть больше 0");

        RuleFor(x => x.FrontBearing)
            .NotNull().WithMessage("Необходимо указать данные переднего подшипника")
            .ChildRules(bearing =>
            {
                bearing.RuleFor(b => b.Type)
                    .NotEmpty().WithMessage("Тип переднего подшипника обязателен")
                    .MaximumLength(100);
                bearing.RuleFor(b => b.Manufacturer)
                    .NotEmpty().WithMessage("Производитель переднего подшипника обязателен")
                    .MaximumLength(200);
                bearing.RuleFor(b => b.Supplier)
                    .NotEmpty().WithMessage("Поставщик переднего подшипника обязателен")
                    .MaximumLength(200);
            });

        RuleFor(x => x.RearBearing)
            .NotNull().WithMessage("Необходимо указать данные заднего подшипника")
            .ChildRules(bearing =>
            {
                bearing.RuleFor(b => b.Type)
                    .NotEmpty().WithMessage("Тип заднего подшипника обязателен")
                    .MaximumLength(100);
                bearing.RuleFor(b => b.Manufacturer)
                    .NotEmpty().WithMessage("Производитель заднего подшипника обязателен")
                    .MaximumLength(200);
                bearing.RuleFor(b => b.Supplier)
                    .NotEmpty().WithMessage("Поставщик заднего подшипника обязателен")
                    .MaximumLength(200);
            });

        RuleFor(x => x.InitialLocation)
            .NotEmpty().WithMessage("Начальное место установки обязательно");

        RuleFor(x => x.MountingType)
            .IsInEnum().WithMessage("Укажите корректный тип монтажа: Feet, Flange, FeetAndFlange, SmallFlange, FeetAndSmallFlange");
    }
}

/// <summary>
/// Валидатор для DTO установки инвентарного номера двигателя.
/// </summary>
public class SetInventoryNumberDtoValidator : AbstractValidator<SetInventoryNumberDto>
{
    public SetInventoryNumberDtoValidator()
    {
        RuleFor(x => x.InventoryNumber)
            .MaximumLength(50).WithMessage("Инвентарный номер не должен превышать 50 символов")
            .Matches(@"^[a-zA-Z0-9\-_\/\.]*$").WithMessage("Инвентарный номер может содержать только буквы, цифры и символы - _ / .")
            .When(x => !string.IsNullOrWhiteSpace(x.InventoryNumber));

        RuleFor(x => x.InventoryNumber)
            .Must(inv => inv == null || !string.IsNullOrWhiteSpace(inv))
            .WithMessage("Инвентарный номер не может быть пустой строкой. Используйте null для удаления номера.");
    }
}