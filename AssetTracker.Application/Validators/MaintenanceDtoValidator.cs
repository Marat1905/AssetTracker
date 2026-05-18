using AssetTracker.Application.DTOs;
using AssetTracker.Domain.Enums;
using FluentValidation;

namespace AssetTracker.Application.Validators;

public class MaintenanceDtoValidator : AbstractValidator<MaintenanceDto>
{
    public MaintenanceDtoValidator()
    {
        RuleFor(x => x.WorkType).IsInEnum();

        When(x => x.WorkType == MaintenanceType.Lubrication, () =>
        {
            RuleFor(x => x.BearingPosition)
                .NotNull().WithMessage("Для смазки необходимо указать позицию подшипника (передний/задний)");

            RuleFor(x => x.LubricantTypeId)
                .NotNull().WithMessage("Для смазки необходимо указать тип смазки")
                .GreaterThan(0).WithMessage("Некорректный идентификатор типа смазки");

            RuleFor(x => x.NewBearingId).Null().WithMessage("Поле NewBearingId не используется при смазке");
        });

        When(x => x.WorkType == MaintenanceType.BearingReplacement, () =>
        {
            RuleFor(x => x.BearingPosition)
                .NotNull().WithMessage("Для замены подшипника необходимо указать позицию (передний/задний)");

            RuleFor(x => x.NewBearingId)
                .NotNull().WithMessage("Для замены подшипника необходимо указать ID нового подшипника")
                .GreaterThan(0).WithMessage("ID подшипника должен быть положительным");

            RuleFor(x => x.LubricantTypeId).Null().WithMessage("Поле LubricantTypeId не используется при замене подшипника");
        });

        When(x => x.WorkType != MaintenanceType.Lubrication && x.WorkType != MaintenanceType.BearingReplacement, () =>
        {
            RuleFor(x => x.BearingPosition).Null();
            RuleFor(x => x.LubricantTypeId).Null();
            RuleFor(x => x.NewBearingId).Null();
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

        When(x => x.NewBearingId.HasValue, () =>
        {
            RuleFor(x => x.NewBearingId.Value)
                .GreaterThan(0).WithMessage("Идентификатор подшипника должен быть положительным");
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