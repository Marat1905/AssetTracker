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
        });

        When(x => x.WorkType != MaintenanceType.Lubrication, () =>
        {
            RuleFor(x => x.BearingPosition).Null().WithMessage("Поле BearingPosition допустимо только для смазки");
            RuleFor(x => x.LubricantTypeId).Null().WithMessage("Поле LubricantTypeId допустимо только для смазки");
        });
    }
}