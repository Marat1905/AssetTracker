using FluentValidation.TestHelper;
using AssetTracker.Application.DTOs;
using AssetTracker.Application.Validators;
using AssetTracker.Domain.Enums;

namespace AssetTracker.Tests.Unit.Validators;

public class CreateMotorDtoValidatorTests
{
    private readonly CreateMotorDtoValidator _validator;

    public CreateMotorDtoValidatorTests()
    {
        _validator = new CreateMotorDtoValidator();
    }

    /// <summary>
    /// Создаёт DTO со всеми обязательными полями (Type, Power, Speed, InitialLocation, MountingType)
    /// и корректным инвентарным номером, но без диаметра вала и без подшипников.
    /// Используется для изоляции тестов, проверяющих поведение только одного поля:
    /// например, чтобы проверить поведение подшипника, достаточно присвоить только его.
    /// </summary>
    private static CreateMotorDto CreateBaseDto()
    {
        return new CreateMotorDto
        {
            InventoryNumber = "TEST-1",
            Type = "АИР112M4",
            ShaftDiameter = null,
            Power = 7.5,
            Speed = 1500,
            InitialLocation = "Цех 3",
            MountingType = MountingType.Feet,
            FrontBearing = null,
            RearBearing = null
        };
    }

    // ================== Основные валидные сценарии ==================

    [Fact]
    public void ValidDto_WithInventoryNumber_ShouldNotHaveErrors()
    {
        var dto = new CreateMotorDto
        {
            InventoryNumber = "100",
            Type = "АИР112M4",
            ShaftDiameter = 28,
            Power = 7.5,
            Speed = 1500,
            InitialLocation = "Цех 3",
            MountingType = MountingType.Feet,
            FrontBearing = new CreateBearingDto { Type = "6205", Manufacturer = "SKF", Supplier = "OOO" },
            RearBearing = new CreateBearingDto { Type = "6205", Manufacturer = "SKF", Supplier = "OOO" }
        };

        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void ValidDto_WithoutInventoryNumber_ShouldNotHaveErrors()
    {
        var dto = new CreateMotorDto
        {
            InventoryNumber = null,
            Type = "АИР112M4",
            ShaftDiameter = 28,
            Power = 7.5,
            Speed = 1500,
            InitialLocation = "Цех 3",
            MountingType = MountingType.Feet,
            FrontBearing = new CreateBearingDto { Type = "6205", Manufacturer = "SKF", Supplier = "OOO" },
            RearBearing = new CreateBearingDto { Type = "6205", Manufacturer = "SKF", Supplier = "OOO" }
        };

        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void ValidDto_WithoutShaftDiameterAndBearings_ShouldNotHaveErrors()
    {
        // Новый сценарий: диаметр вала и оба подшипника не заданы — двигатель должен быть валиден.
        var dto = new CreateMotorDto
        {
            InventoryNumber = "101",
            Type = "АИР112M4",
            ShaftDiameter = null,
            Power = 7.5,
            Speed = 1500,
            InitialLocation = "Цех 3",
            MountingType = MountingType.Feet,
            FrontBearing = null,
            RearBearing = null
        };

        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void ValidDto_WithShaftDiameterButWithoutBearings_ShouldNotHaveErrors()
    {
        // Диаметр вала задан, подшипники — нет: двигатель всё ещё валиден.
        var dto = new CreateMotorDto
        {
            InventoryNumber = "102",
            Type = "АИР112M4",
            ShaftDiameter = 28,
            Power = 7.5,
            Speed = 1500,
            InitialLocation = "Цех 3",
            MountingType = MountingType.Feet,
            FrontBearing = null,
            RearBearing = null
        };

        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void ValidDto_WithOnlyFrontBearing_ShouldNotHaveErrors()
    {
        // Указан только передний подшипник — валидно.
        var dto = new CreateMotorDto
        {
            InventoryNumber = "103",
            Type = "АИР112M4",
            ShaftDiameter = null,
            Power = 7.5,
            Speed = 1500,
            InitialLocation = "Цех 3",
            MountingType = MountingType.Feet,
            FrontBearing = new CreateBearingDto { Type = "6205", Manufacturer = "SKF", Supplier = "OOO" },
            RearBearing = null
        };

        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void ValidDto_WithOnlyRearBearing_ShouldNotHaveErrors()
    {
        // Указан только задний подшипник — валидно.
        var dto = new CreateMotorDto
        {
            InventoryNumber = "104",
            Type = "АИР112M4",
            ShaftDiameter = null,
            Power = 7.5,
            Speed = 1500,
            InitialLocation = "Цех 3",
            MountingType = MountingType.Feet,
            FrontBearing = null,
            RearBearing = new CreateBearingDto { Type = "6205", Manufacturer = "SKF", Supplier = "OOO" }
        };

        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    // ================== Инвентарный номер ==================

    [Fact]
    public void InventoryNumber_Null_ShouldBeValid()
    {
        var dto = new CreateMotorDto { InventoryNumber = null };
        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveValidationErrorFor(x => x.InventoryNumber);
    }

    [Fact]
    public void InventoryNumber_EmptyString_ShouldHaveError()
    {
        var dto = new CreateMotorDto { InventoryNumber = "" };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.InventoryNumber);
    }

    [Fact]
    public void InventoryNumber_Whitespace_ShouldHaveError()
    {
        var dto = new CreateMotorDto { InventoryNumber = "   " };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.InventoryNumber);
    }

    [Fact]
    public void InventoryNumber_TooLong_ShouldHaveError()
    {
        var dto = new CreateMotorDto { InventoryNumber = new string('A', 51) };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.InventoryNumber);
    }

    [Fact]
    public void InventoryNumber_WithValidCharacters_ShouldBeValid()
    {
        var validNumbers = new[] { "ABC-123", "456_789", "123/456", "789.123", "A1B2C3" };
        foreach (var inv in validNumbers)
        {
            var dto = new CreateMotorDto { InventoryNumber = inv };
            var result = _validator.TestValidate(dto);
            result.ShouldNotHaveValidationErrorFor(x => x.InventoryNumber);
        }
    }

    [Fact]
    public void InventoryNumber_WithInvalidCharacters_ShouldHaveError()
    {
        var invalidNumbers = new[] { "123!", "@ABC", "123#", "123$", "123%" };
        foreach (var inv in invalidNumbers)
        {
            var dto = new CreateMotorDto { InventoryNumber = inv };
            var result = _validator.TestValidate(dto);
            result.ShouldHaveValidationErrorFor(x => x.InventoryNumber);
        }
    }

    // ================== Тип ==================

    [Fact]
    public void Type_Empty_ShouldHaveError()
    {
        var dto = new CreateMotorDto { Type = "" };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.Type);
    }

    [Fact]
    public void Type_Null_ShouldHaveError()
    {
        var dto = new CreateMotorDto { Type = null! };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.Type);
    }

    // ================== Диаметр вала ==================

    [Fact]
    public void ShaftDiameter_Null_ShouldBeValid()
    {
        // Диаметр вала — необязательное поле, null допускается.
        var dto = new CreateMotorDto { ShaftDiameter = null };
        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveValidationErrorFor(x => x.ShaftDiameter);
    }

    [Fact]
    public void ShaftDiameter_Zero_ShouldHaveError()
    {
        // Если значение задано, оно должно быть > 0.
        var dto = new CreateMotorDto { ShaftDiameter = 0 };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.ShaftDiameter);
    }

    [Fact]
    public void ShaftDiameter_Negative_ShouldHaveError()
    {
        var dto = new CreateMotorDto { ShaftDiameter = -5 };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.ShaftDiameter);
    }

    [Fact]
    public void ShaftDiameter_Positive_ShouldBeValid()
    {
        var dto = new CreateMotorDto { ShaftDiameter = 28 };
        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveValidationErrorFor(x => x.ShaftDiameter);
    }

    // ================== Мощность ==================

    [Fact]
    public void Power_Negative_ShouldHaveError()
    {
        var dto = new CreateMotorDto { Power = -1 };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.Power);
    }

    [Fact]
    public void Power_Zero_ShouldHaveError()
    {
        var dto = new CreateMotorDto { Power = 0 };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.Power);
    }

    // ================== Обороты ==================

    [Fact]
    public void Speed_Zero_ShouldHaveError()
    {
        var dto = new CreateMotorDto { Speed = 0 };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.Speed);
    }

    [Fact]
    public void Speed_Negative_ShouldHaveError()
    {
        var dto = new CreateMotorDto { Speed = -100 };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.Speed);
    }

    // ================== Начальное местоположение ==================

    [Fact]
    public void InitialLocation_Empty_ShouldHaveError()
    {
        var dto = new CreateMotorDto { InitialLocation = "" };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.InitialLocation);
    }

    [Fact]
    public void InitialLocation_Null_ShouldHaveError()
    {
        var dto = new CreateMotorDto { InitialLocation = null! };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.InitialLocation);
    }

    // ================== Передний подшипник ==================

    [Fact]
    public void FrontBearing_Null_ShouldBeValid()
    {
        // Передний подшипник — необязательный. Null допускается.
        var dto = CreateBaseDto();
        dto.FrontBearing = null;

        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void FrontBearing_AllFieldsEmptyStrings_ShouldBeValid()
    {
        // Если все три поля — пустые строки, подшипник считается незаполненным, валидация проходит.
        var dto = CreateBaseDto();
        dto.FrontBearing = new CreateBearingDto { Type = "", Manufacturer = "", Supplier = "" };

        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void FrontBearing_AllFieldsWhitespace_ShouldBeValid()
    {
        // Если все три поля состоят из пробелов, подшипник тоже считается незаполненным.
        var dto = CreateBaseDto();
        dto.FrontBearing = new CreateBearingDto { Type = "   ", Manufacturer = "   ", Supplier = "   " };

        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void FrontBearing_OnlyTypeFilled_ShouldHaveErrorsForOtherFields()
    {
        // Если заполнено хотя бы одно поле, остальные становятся обязательными.
        var dto = CreateBaseDto();
        dto.FrontBearing = new CreateBearingDto { Type = "6205", Manufacturer = "", Supplier = "" };

        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.FrontBearing!.Manufacturer);
        result.ShouldHaveValidationErrorFor(x => x.FrontBearing!.Supplier);
    }

    [Fact]
    public void FrontBearing_OnlyManufacturerFilled_ShouldHaveErrorsForOtherFields()
    {
        var dto = CreateBaseDto();
        dto.FrontBearing = new CreateBearingDto { Type = "", Manufacturer = "SKF", Supplier = "" };

        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.FrontBearing!.Type);
        result.ShouldHaveValidationErrorFor(x => x.FrontBearing!.Supplier);
    }

    [Fact]
    public void FrontBearing_OnlySupplierFilled_ShouldHaveErrorsForOtherFields()
    {
        var dto = CreateBaseDto();
        dto.FrontBearing = new CreateBearingDto { Type = "", Manufacturer = "", Supplier = "OOO" };

        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.FrontBearing!.Type);
        result.ShouldHaveValidationErrorFor(x => x.FrontBearing!.Manufacturer);
    }

    [Fact]
    public void FrontBearing_AllFieldsFilled_ShouldBeValid()
    {
        var dto = CreateBaseDto();
        dto.FrontBearing = new CreateBearingDto { Type = "6205", Manufacturer = "SKF", Supplier = "OOO" };

        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    // ================== Задний подшипник ==================

    [Fact]
    public void RearBearing_Null_ShouldBeValid()
    {
        // Задний подшипник — необязательный. Null допускается.
        var dto = CreateBaseDto();
        dto.RearBearing = null;

        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void RearBearing_AllFieldsEmptyStrings_ShouldBeValid()
    {
        var dto = CreateBaseDto();
        dto.RearBearing = new CreateBearingDto { Type = "", Manufacturer = "", Supplier = "" };

        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void RearBearing_AllFieldsWhitespace_ShouldBeValid()
    {
        var dto = CreateBaseDto();
        dto.RearBearing = new CreateBearingDto { Type = "   ", Manufacturer = "   ", Supplier = "   " };

        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void RearBearing_OnlyTypeFilled_ShouldHaveErrorsForOtherFields()
    {
        var dto = CreateBaseDto();
        dto.RearBearing = new CreateBearingDto { Type = "6205", Manufacturer = "", Supplier = "" };

        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.RearBearing!.Manufacturer);
        result.ShouldHaveValidationErrorFor(x => x.RearBearing!.Supplier);
    }

    [Fact]
    public void RearBearing_OnlyManufacturerFilled_ShouldHaveErrorsForOtherFields()
    {
        var dto = CreateBaseDto();
        dto.RearBearing = new CreateBearingDto { Type = "", Manufacturer = "SKF", Supplier = "" };

        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.RearBearing!.Type);
        result.ShouldHaveValidationErrorFor(x => x.RearBearing!.Supplier);
    }

    [Fact]
    public void RearBearing_OnlySupplierFilled_ShouldHaveErrorsForOtherFields()
    {
        var dto = CreateBaseDto();
        dto.RearBearing = new CreateBearingDto { Type = "", Manufacturer = "", Supplier = "OOO" };

        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.RearBearing!.Type);
        result.ShouldHaveValidationErrorFor(x => x.RearBearing!.Manufacturer);
    }

    [Fact]
    public void RearBearing_AllFieldsFilled_ShouldBeValid()
    {
        var dto = CreateBaseDto();
        dto.RearBearing = new CreateBearingDto { Type = "6205", Manufacturer = "SKF", Supplier = "OOO" };

        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    // ================== Тип монтажа ==================

    [Fact]
    public void MountingType_InvalidEnum_ShouldHaveError()
    {
        var dto = new CreateMotorDto { MountingType = (MountingType)999 };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.MountingType);
    }
}