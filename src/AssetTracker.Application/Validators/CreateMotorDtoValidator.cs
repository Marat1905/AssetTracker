using AssetTracker.Application.DTOs;
using FluentValidation;

namespace AssetTracker.Application.Validators;

/// <summary>
/// Валидатор для DTO создания двигателя.
/// Диаметр вала и подшипники (передний и задний) необязательны.
/// Если объект подшипника отсутствует (null) или все три его поля
/// (тип, производитель, поставщик) пусты (пустая строка либо только пробелы),
/// валидация подшипника не производится.
/// Если же хотя бы одно из трёх полей заполнено — все три поля становятся обязательными.
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

        // Диаметр вала необязателен, но если задан — должен быть > 0
        RuleFor(x => x.ShaftDiameter)
            .GreaterThan(0).WithMessage("Диаметр вала должен быть больше 0 мм")
            .When(x => x.ShaftDiameter.HasValue);

        RuleFor(x => x.Power)
            .GreaterThan(0).WithMessage("Мощность должна быть больше 0");

        RuleFor(x => x.Speed)
            .GreaterThan(0).WithMessage("Обороты должны быть больше 0");

        // Передний подшипник — необязателен.
        // Проверяем только если хотя бы одно из трёх полей заполнено.
        When(x => HasAnyFieldFilled(x.FrontBearing), () =>
        {
            RuleFor(x => x.FrontBearing!.Type)
                .NotEmpty().WithMessage("Тип переднего подшипника обязателен, если указан хотя бы один параметр подшипника")
                .MaximumLength(100);
            RuleFor(x => x.FrontBearing!.Manufacturer)
                .NotEmpty().WithMessage("Производитель переднего подшипника обязателен, если указан хотя бы один параметр подшипника")
                .MaximumLength(200);
            RuleFor(x => x.FrontBearing!.Supplier)
                .NotEmpty().WithMessage("Поставщик переднего подшипника обязателен, если указан хотя бы один параметр подшипника")
                .MaximumLength(200);
        });

        // Задний подшипник — необязателен.
        // Проверяем только если хотя бы одно из трёх полей заполнено.
        When(x => HasAnyFieldFilled(x.RearBearing), () =>
        {
            RuleFor(x => x.RearBearing!.Type)
                .NotEmpty().WithMessage("Тип заднего подшипника обязателен, если указан хотя бы один параметр подшипника")
                .MaximumLength(100);
            RuleFor(x => x.RearBearing!.Manufacturer)
                .NotEmpty().WithMessage("Производитель заднего подшипника обязателен, если указан хотя бы один параметр подшипника")
                .MaximumLength(200);
            RuleFor(x => x.RearBearing!.Supplier)
                .NotEmpty().WithMessage("Поставщик заднего подшипника обязателен, если указан хотя бы один параметр подшипника")
                .MaximumLength(200);
        });

        RuleFor(x => x.InitialLocation)
            .NotEmpty().WithMessage("Начальное место установки обязательно");

        RuleFor(x => x.MountingType)
            .IsInEnum().WithMessage("Укажите корректный тип монтажа: Feet, Flange, FeetAndFlange, SmallFlange, FeetAndSmallFlange");
    }

    /// <summary>
    /// Проверяет, заполнено ли хотя бы одно поле объекта подшипника.
    /// Возвращает false, если объект null, либо все три поля (Type, Manufacturer, Supplier)
    /// пусты или состоят только из пробелов.
    /// </summary>
    /// <param name="bearing">DTO подшипника или null.</param>
    /// <returns>True, если хотя бы одно поле содержит непустое значение.</returns>
    private static bool HasAnyFieldFilled(CreateBearingDto? bearing)
    {
        if (bearing == null) return false;
        return !string.IsNullOrWhiteSpace(bearing.Type)
            || !string.IsNullOrWhiteSpace(bearing.Manufacturer)
            || !string.IsNullOrWhiteSpace(bearing.Supplier);
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