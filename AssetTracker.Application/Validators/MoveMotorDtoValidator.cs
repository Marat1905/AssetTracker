using AssetTracker.Application.DTOs;
using FluentValidation;

namespace AssetTracker.Application.Validators;
public class MoveMotorDtoValidator : AbstractValidator<MoveMotorDto>
{
    public MoveMotorDtoValidator()
    {
        RuleFor(x => x.NewLocation)
            .NotEmpty().WithMessage("Новое место установки не может быть пустым");
        // NewStatus может быть null или любым значением enum, дополнительных проверок не требуется
    }
}
