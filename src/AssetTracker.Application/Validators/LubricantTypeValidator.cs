using AssetTracker.Application.DTOs;
using FluentValidation;

namespace AssetTracker.Application.Validators;

/// <summary>
/// Валидатор для DTO создания типа смазки.
/// </summary>
public class CreateLubricantTypeValidator : AbstractValidator<CreateLubricantTypeDto>
{
    public CreateLubricantTypeValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Название типа смазки обязательно")
            .MaximumLength(100);

        RuleFor(x => x.Description)
            .MaximumLength(500);
    }
}

/// <summary>
/// Валидатор для DTO обновления типа смазки.
/// </summary>
public class UpdateLubricantTypeValidator : AbstractValidator<UpdateLubricantTypeDto>
{
    public UpdateLubricantTypeValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Название типа смазки обязательно")
            .MaximumLength(100);

        RuleFor(x => x.Description)
            .MaximumLength(500);
    }
}