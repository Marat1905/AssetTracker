using FluentValidation.TestHelper;
using AssetTracker.Application.DTOs;
using AssetTracker.Application.Validators;

namespace AssetTracker.Tests.Unit.Validators;

public class SetInventoryNumberDtoValidatorTests
{
    private readonly SetInventoryNumberDtoValidator _validator;

    public SetInventoryNumberDtoValidatorTests()
    {
        _validator = new SetInventoryNumberDtoValidator();
    }

    [Fact]
    public void ValidDto_WithValidInventoryNumber_ShouldNotHaveErrors()
    {
        var dto = new SetInventoryNumberDto { InventoryNumber = "ABC-123" };
        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void ValidDto_WithNullInventoryNumber_ShouldNotHaveErrors()
    {
        var dto = new SetInventoryNumberDto { InventoryNumber = null };
        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void InventoryNumber_EmptyString_ShouldHaveError()
    {
        var dto = new SetInventoryNumberDto { InventoryNumber = "" };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.InventoryNumber);
    }

    [Fact]
    public void InventoryNumber_Whitespace_ShouldHaveError()
    {
        var dto = new SetInventoryNumberDto { InventoryNumber = "   " };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.InventoryNumber);
    }

    [Fact]
    public void InventoryNumber_TooLong_ShouldHaveError()
    {
        var dto = new SetInventoryNumberDto { InventoryNumber = new string('A', 51) };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.InventoryNumber);
    }

    [Fact]
    public void InventoryNumber_WithValidCharacters_ShouldBeValid()
    {
        // Латиница, цифры, разрешённые спецсимволы
        var validNumbers = new[]
        {
            "ABC-123",
            "456_789",
            "123/456",
            "789.123",
            "A1B2C3",
            "123",
        };
        foreach (var inv in validNumbers)
        {
            var dto = new SetInventoryNumberDto { InventoryNumber = inv };
            var result = _validator.TestValidate(dto);
            result.ShouldNotHaveValidationErrorFor(x => x.InventoryNumber);
        }
    }

    /// <summary>
    /// Кириллица теперь разрешена (после исправления регулярки).
    /// Покрываем: только кириллица, смесь с латиницей/цифрами, спецсимволы.
    /// </summary>
    [Fact]
    public void InventoryNumber_WithCyrillicCharacters_ShouldBeValid()
    {
        var validNumbers = new[]
        {
            "я035084",      // реальный кейс из бага
            "АБВ-123",
            "АБВ123",
            "Я-001",
            "а-001",
            "А1Б2В3",
            "Цех-1/2",
            "Щ.001",
            "Э_42",
        };
        foreach (var inv in validNumbers)
        {
            var dto = new SetInventoryNumberDto { InventoryNumber = inv };
            var result = _validator.TestValidate(dto);
            result.ShouldNotHaveValidationErrorFor(x => x.InventoryNumber);
        }
    }

    /// <summary>
    /// Буквы «ё»/«Ё» находятся вне диапазона «а-я» (U+0430–U+044F),
    /// поэтому добавлены в регулярку отдельно. Фиксируем это тестом.
    /// </summary>
    [Fact]
    public void InventoryNumber_WithYoCharacter_ShouldBeValid()
    {
        var validNumbers = new[] { "ёжик-1", "ЁЖ-2", "АЁ-3", "ё123", "Ёлка" };
        foreach (var inv in validNumbers)
        {
            var dto = new SetInventoryNumberDto { InventoryNumber = inv };
            var result = _validator.TestValidate(dto);
            result.ShouldNotHaveValidationErrorFor(x => x.InventoryNumber);
        }
    }

    /// <summary>
    /// Смешение латиницы и кириллицы допустимо (обе разрешены).
    /// Это важно, потому что визуально похожие символы (A/А, B/В) могут
    /// появляться в номерах из разных источников.
    /// </summary>
    [Fact]
    public void InventoryNumber_WithMixedLatinAndCyrillic_ShouldBeValid()
    {
        var validNumbers = new[] { "A-Б-123", "ABВ-42", "АБC-99", "aБc_1" };
        foreach (var inv in validNumbers)
        {
            var dto = new SetInventoryNumberDto { InventoryNumber = inv };
            var result = _validator.TestValidate(dto);
            result.ShouldNotHaveValidationErrorFor(x => x.InventoryNumber);
        }
    }

    [Fact]
    public void InventoryNumber_WithInvalidCharacters_ShouldHaveError()
    {
        // ВНИМАНИЕ: «русский» убран из этого списка — кириллица теперь допустима.
        var invalidNumbers = new[]
        {
            "123!",      // восклицательный знак
            "@ABC",      // собака
            "123#",      // решётка
            "123$",      // доллар
            "123%",      // процент
            "space in",  // пробел
            "123,",      // запятая
            "123;",      // точка с запятой
            "123+",      // плюс
            "123=",      // равно
            "123*",      // звёздочка
            "123(",      // скобка
            "123'",      // апостроф
            "123\"",     // кавычка
            "ABC\n123",  // перевод строки
            "ABC\t123",  // табуляция
        };
        foreach (var inv in invalidNumbers)
        {
            var dto = new SetInventoryNumberDto { InventoryNumber = inv };
            var result = _validator.TestValidate(dto);
            result.ShouldHaveValidationErrorFor(x => x.InventoryNumber);
        }
    }

    [Fact]
    public void InventoryNumber_ExactlyMaxLength_ShouldBeValid()
    {
        // 50 латинских символов
        var dto = new SetInventoryNumberDto { InventoryNumber = new string('A', 50) };
        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveValidationErrorFor(x => x.InventoryNumber);
    }

    [Fact]
    public void InventoryNumber_ExactlyMaxLength_Cyrillic_ShouldBeValid()
    {
        // 50 кириллических символов — проверяем, что ограничение длины
        // посимвольное, а не побайтовое (важно для UTF-8: кириллица занимает 2 байта)
        var dto = new SetInventoryNumberDto { InventoryNumber = new string('А', 50) };
        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveValidationErrorFor(x => x.InventoryNumber);
    }

    [Fact]
    public void InventoryNumber_CyrillicTooLong_ShouldHaveError()
    {
        var dto = new SetInventoryNumberDto { InventoryNumber = new string('А', 51) };
        var result = _validator.TestValidate(dto);
        result.ShouldHaveValidationErrorFor(x => x.InventoryNumber);
    }

    /// <summary>
    /// Регрессионный тест на баг из реального использования:
    /// инвентарный номер «я035084» ранее не проходил валидацию.
    /// </summary>
    [Fact]
    public void InventoryNumber_Ya035084_RegressionTest_ShouldBeValid()
    {
        var dto = new SetInventoryNumberDto { InventoryNumber = "я035084" };
        var result = _validator.TestValidate(dto);
        result.ShouldNotHaveValidationErrorFor(x => x.InventoryNumber);
    }
}