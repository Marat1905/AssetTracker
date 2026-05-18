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

            RuleFor(x => x.NewBearingType).Null().WithMessage("Поле NewBearingType не используется при смазке");
        });

        // Правила для замены подшипника
        When(x => x.WorkType == MaintenanceType.BearingReplacement, () =>
        {
            RuleFor(x => x.BearingPosition)
                .NotNull().WithMessage("Для замены подшипника необходимо указать позицию (передний/задний)");

            RuleFor(x => x.NewBearingType)
                .NotEmpty().WithMessage("Для замены подшипника необходимо указать новый тип подшипника")
                .MaximumLength(100).WithMessage("Тип подшипника не должен превышать 100 символов");

            RuleFor(x => x.LubricantTypeId).Null().WithMessage("Поле LubricantTypeId не используется при замене подшипника");
        });

        // Для остальных типов работ (StatorRewinding, ShaftRepair) все дополнительные поля должны быть null
        When(x => x.WorkType != MaintenanceType.Lubrication && x.WorkType != MaintenanceType.BearingReplacement, () =>
        {
            RuleFor(x => x.BearingPosition).Null();
            RuleFor(x => x.LubricantTypeId).Null();
            RuleFor(x => x.NewBearingType).Null();
        });
    }
}

/// <summary>
/// Валидатор для редактирования записи обслуживания
/// </summary>
public class UpdateMaintenanceLogDtoValidator : AbstractValidator<UpdateMaintenanceLogDto>
{
    public UpdateMaintenanceLogDtoValidator()
    {
        // Комментарий не длиннее 500 символов
        RuleFor(x => x.Comment)
            .MaximumLength(500).WithMessage("Комментарий не должен превышать 500 символов");

        // Если указан LubricantTypeId, он должен быть положительным
        When(x => x.LubricantTypeId.HasValue, () =>
        {
            RuleFor(x => x.LubricantTypeId.Value)
                .GreaterThan(0).WithMessage("Идентификатор типа смазки должен быть положительным");
        });

        // Если указан NewBearingType, он не должен быть пустым и не длиннее 100 символов
        When(x => !string.IsNullOrWhiteSpace(x.NewBearingType), () =>
        {
            RuleFor(x => x.NewBearingType)
                .MaximumLength(100).WithMessage("Тип подшипника не должен превышать 100 символов");
        });
    }
}

public class UpdateLocationHistoryDtoValidator : AbstractValidator<UpdateLocationHistoryDto>
{
    public UpdateLocationHistoryDtoValidator()
    {
        RuleFor(x => x.Location)
            .NotEmpty().WithMessage("Место расположения не может быть пустым")
            .MaximumLength(200).WithMessage("Место расположения не должно превышать 200 символов");
    }
}