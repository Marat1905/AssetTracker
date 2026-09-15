using AssetTracker.Application.DTOs;
using AssetTracker.Domain.Entities;
using AssetTracker.Domain.Enums;

namespace AssetTracker.Tests.Helpers;

public static class TestDataFactory
{
    public static CreateMotorDto CreateValidCreateMotorDto(string? inventoryNumber = "1001")
    {
        return new CreateMotorDto
        {
            InventoryNumber = inventoryNumber,
            Type = "АИР100L4",
            ShaftDiameter = 28,
            Power = 5.5,
            Speed = 1500,
            Status = MotorStatus.InOperation,
            InitialLocation = "Цех №1",
            MountingType = MountingType.Feet,
            FrontBearing = new CreateBearingDto
            {
                Type = "6205",
                Manufacturer = "SKF",
                Supplier = "ООО ТехКомплект"
            },
            RearBearing = new CreateBearingDto
            {
                Type = "6205",
                Manufacturer = "SKF",
                Supplier = "ООО ТехКомплект"
            }
        };
    }

    public static SetInventoryNumberDto CreateSetInventoryNumberDto(string? inventoryNumber)
    {
        return new SetInventoryNumberDto { InventoryNumber = inventoryNumber };
    }

    public static UpdateMotorDto CreateValidUpdateMotorDto()
    {
        return new UpdateMotorDto
        {
            Type = "АИР112M4 (обновлён)",
            ShaftDiameter = 32,
            Power = 7.5,
            Speed = 1450,
            Status = MotorStatus.Repair,
            MountingType = MountingType.Flange
        };
    }

    public static MaintenanceDto CreateLubricationDto(int lubricantTypeId = 1, BearingPosition position = BearingPosition.Front)
    {
        return new MaintenanceDto
        {
            WorkType = MaintenanceType.Lubrication,
            Comment = "Плановая смазка",
            PerformedBy = "Иванов И.И.",
            BearingPosition = position,
            LubricantTypeId = lubricantTypeId
        };
    }

    public static MaintenanceDto CreateBearingReplacementWithNewBearingDto(BearingPosition position)
    {
        return new MaintenanceDto
        {
            WorkType = MaintenanceType.BearingReplacement,
            Comment = "Замена подшипника из-за износа",
            PerformedBy = "Петров П.П.",
            BearingPosition = position,
            NewBearing = new CreateBearingDto
            {
                Type = "6306",
                Manufacturer = "FAG",
                Supplier = "ООО ПодшипникСервис"
            }
        };
    }

    public static LubricantType CreateLubricantType(string name = "Литол-24")
    {
        return new LubricantType
        {
            Name = name,
            Description = "Многоцелевая смазка"
        };
    }
}