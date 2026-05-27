using AssetTracker.Application.DTOs;
using AssetTracker.Domain.Enums;
using FluentValidation;

namespace AssetTracker.Application.Validators;

/// <summary>
/// Валидатор для DTO добавления записи обслуживания.
/// </summary>
public class MaintenanceDtoValidator : AbstractValidator<MaintenanceDto>
{
    public MaintenanceDtoValidator()
    {
        RuleFor(x => x.WorkType).IsInEnum();

        RuleFor(x => x.PerformedBy)
            .NotEmpty().WithMessage("Необходимо указать, кто выполнил обслуживание")
            .MaximumLength(100).WithMessage("Имя исполнителя не должно превышать 100 символов");

        When(x => x.WorkType == MaintenanceType.Lubrication, () =>
        {
            RuleFor(x => x.BearingPosition)
                .NotNull().WithMessage("Для смазки необходимо указать позицию подшипника (передний/задний)");

            RuleFor(x => x.LubricantTypeId)
                .NotNull().WithMessage("Для смазки необходимо указать тип смазки")
                .GreaterThan(0).WithMessage("Некорректный идентификатор типа смазки");

            RuleFor(x => x.ExistingBearingId).Null().WithMessage("Поле ExistingBearingId не используется при смазке");
            RuleFor(x => x.NewBearing).Null().WithMessage("Поле NewBearing не используется при смазке");
        });

        When(x => x.WorkType == MaintenanceType.BearingReplacement, () =>
        {
            RuleFor(x => x.BearingPosition)
                .NotNull().WithMessage("Для замены подшипника необходимо указать позицию (передний/задний)");

            RuleFor(x => x)
                .Must(dto => dto.ExistingBearingId.HasValue ^ (dto.NewBearing != null))
                .WithMessage("Для замены подшипника необходимо указать либо ExistingBearingId, либо NewBearing (но не оба)");

            When(x => x.NewBearing != null, () =>
            {
                RuleFor(x => x.NewBearing!.Type)
                    .NotEmpty().WithMessage("Для нового подшипника необходимо указать тип")
                    .MaximumLength(100);
                RuleFor(x => x.NewBearing!.Manufacturer)
                    .NotEmpty().WithMessage("Для нового подшипника необходимо указать производителя")
                    .MaximumLength(200);
                RuleFor(x => x.NewBearing!.Supplier)
                    .NotEmpty().WithMessage("Для нового подшипника необходимо указать поставщика")
                    .MaximumLength(200);
            });

            RuleFor(x => x.LubricantTypeId).Null().WithMessage("Поле LubricantTypeId не используется при замене подшипника");
        });

        When(x => x.WorkType != MaintenanceType.Lubrication && x.WorkType != MaintenanceType.BearingReplacement, () =>
        {
            RuleFor(x => x.BearingPosition).Null();
            RuleFor(x => x.LubricantTypeId).Null();
            RuleFor(x => x.ExistingBearingId).Null();
            RuleFor(x => x.NewBearing).Null();
        });
    }
}

/// <summary>
/// Валидатор для DTO редактирования записи обслуживания.
/// </summary>
public class UpdateMaintenanceLogDtoValidator : AbstractValidator<UpdateMaintenanceLogDto>
{
    public UpdateMaintenanceLogDtoValidator()
    {
        RuleFor(x => x.Comment)
            .MaximumLength(500).WithMessage("Комментарий не должен превышать 500 символов");

        RuleFor(x => x.PerformedBy)
            .MaximumLength(100).WithMessage("Имя исполнителя не должно превышать 100 символов")
            .When(x => x.PerformedBy != null);

        When(x => x.LubricantTypeId.HasValue, () =>
        {
            RuleFor(x => x.LubricantTypeId.Value)
                .GreaterThan(0).WithMessage("Идентификатор типа смазки должен быть положительным");
        });

        When(x => x.ExistingBearingId.HasValue, () =>
        {
            RuleFor(x => x.ExistingBearingId.Value)
                .GreaterThan(0).WithMessage("Идентификатор подшипника должен быть положительным");
        });

        When(x => x.NewBearing != null, () =>
        {
            RuleFor(x => x.NewBearing!.Type)
                .NotEmpty().WithMessage("Тип подшипника обязателен")
                .MaximumLength(100);
            RuleFor(x => x.NewBearing!.Manufacturer)
                .NotEmpty().WithMessage("Производитель подшипника обязателен")
                .MaximumLength(200);
            RuleFor(x => x.NewBearing!.Supplier)
                .NotEmpty().WithMessage("Поставщик подшипника обязателен")
                .MaximumLength(200);
        });
    }
}

/// <summary>
/// Валидатор для DTO редактирования записи истории перемещений.
/// </summary>
public class UpdateLocationHistoryDtoValidator : AbstractValidator<UpdateLocationHistoryDto>
{
    public UpdateLocationHistoryDtoValidator()
    {
        RuleFor(x => x.Location)
            .NotEmpty().WithMessage("Место расположения не может быть пустым")
            .MaximumLength(200).WithMessage("Место расположения не должно превышать 200 символов");
    }
}