using AssetTracker.Application.DTOs;
using AssetTracker.Domain.Enums;
using FluentValidation;

namespace AssetTracker.Application.Validators;

public class MaintenanceDtoValidator : AbstractValidator<MaintenanceDto>
{
    public MaintenanceDtoValidator()
    {
        RuleFor(x => x.WorkType).IsInEnum();

        // Правила для смазки
        When(x => x.WorkType == MaintenanceType.Lubrication, () =>
        {
            RuleFor(x => x.BearingPosition)
                .NotNull().WithMessage("Для смазки необходимо указать позицию подшипника (передний/задний)");

            RuleFor(x => x.LubricantTypeId)
                .NotNull().WithMessage("Для смазки необходимо указать тип смазки")
                .GreaterThan(0).WithMessage("Некорректный идентификатор типа смазки");

            RuleFor(x => x.NewBearing).Null().WithMessage("Поле NewBearing не используется при смазке");
        });

        // Правила для замены подшипника
        When(x => x.WorkType == MaintenanceType.BearingReplacement, () =>
        {
            RuleFor(x => x.BearingPosition)
                .NotNull().WithMessage("Для замены подшипника необходимо указать позицию (передний/задний)");

            RuleFor(x => x.NewBearing)
                .NotNull().WithMessage("Для замены подшипника необходимо указать данные нового подшипника")
                .ChildRules(bearing =>
                {
                    bearing.RuleFor(b => b.Type).NotEmpty().WithMessage("Тип нового подшипника обязателен");
                    bearing.RuleFor(b => b.Manufacturer).NotEmpty().WithMessage("Производитель нового подшипника обязателен");
                    bearing.RuleFor(b => b.Supplier).NotEmpty().WithMessage("Поставщик нового подшипника обязателен");
                });

            RuleFor(x => x.LubricantTypeId).Null().WithMessage("Поле LubricantTypeId не используется при замене подшипника");
        });

        // Для остальных типов работ все дополнительные поля должны быть null
        When(x => x.WorkType != MaintenanceType.Lubrication && x.WorkType != MaintenanceType.BearingReplacement, () =>
        {
            RuleFor(x => x.BearingPosition).Null();
            RuleFor(x => x.LubricantTypeId).Null();
            RuleFor(x => x.NewBearing).Null();
        });
    }
}

public class UpdateMaintenanceLogDtoValidator : AbstractValidator<UpdateMaintenanceLogDto>
{
    public UpdateMaintenanceLogDtoValidator()
    {
        RuleFor(x => x.Comment)
            .MaximumLength(500).WithMessage("Комментарий не должен превышать 500 символов");

        When(x => x.LubricantTypeId.HasValue, () =>
        {
            RuleFor(x => x.LubricantTypeId.Value)
                .GreaterThan(0).WithMessage("Идентификатор типа смазки должен быть положительным");
        });

        // Если обновляются данные подшипника при замене – валидируем
        When(x => x.NewBearing != null, () =>
        {
            RuleFor(x => x.NewBearing!.Type).NotEmpty().WithMessage("Тип подшипника обязателен");
            RuleFor(x => x.NewBearing!.Manufacturer).NotEmpty().WithMessage("Производитель подшипника обязателен");
            RuleFor(x => x.NewBearing!.Supplier).NotEmpty().WithMessage("Поставщик подшипника обязателен");
        });
    }
}