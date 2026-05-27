using AssetTracker.Application.DTOs;
using AssetTracker.Application.Mappings;
using AssetTracker.Domain.Entities;
using AutoMapper;
using Microsoft.Extensions.Logging.Abstractions;

namespace AssetTracker.Tests.Helpers;

/// <summary>
/// Расширенный профиль маппинга для тестов (можно использовать основной MappingProfile)
/// </summary>
public class TestMapperProfile : Profile
{
    public TestMapperProfile()
    {
        // Используем реальный профиль из приложения
        CreateMap<CreateMotorDto, Motor>()
            .ForMember(dest => dest.FrontBearing, opt => opt.Ignore())
            .ForMember(dest => dest.RearBearing, opt => opt.Ignore())
            .ForMember(dest => dest.FrontBearingId, opt => opt.Ignore())
            .ForMember(dest => dest.RearBearingId, opt => opt.Ignore());
        CreateMap<UpdateMotorDto, Motor>();
        CreateMap<CreateBearingDto, Bearing>();
        CreateMap<Bearing, BearingDto>();
        CreateMap<UpdateBearingDto, Bearing>();
        CreateMap<LocationHistory, LocationHistoryDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
        CreateMap<MaintenanceLog, MaintenanceLogDto>()
            .ForMember(dest => dest.WorkType, opt => opt.MapFrom(src => src.WorkType.ToString()))
            .ForMember(dest => dest.BearingPosition, opt => opt.MapFrom(src => src.BearingPosition.HasValue ? src.BearingPosition.Value.ToString() : null))
            .ForMember(dest => dest.LubricantTypeName, opt => opt.MapFrom(src => src.LubricantType != null ? src.LubricantType.Name : null))
            .ForMember(dest => dest.OldBearing, opt => opt.MapFrom(src => src.OldBearing))
            .ForMember(dest => dest.NewBearing, opt => opt.MapFrom(src => src.NewBearing))
            .ForMember(dest => dest.PerformedBy, opt => opt.MapFrom(src => src.PerformedBy));
        CreateMap<Motor, MotorFullHistoryDto>()
            .ForMember(dest => dest.FrontBearing, opt => opt.MapFrom(src => src.FrontBearing))
            .ForMember(dest => dest.RearBearing, opt => opt.MapFrom(src => src.RearBearing))
            .ForMember(dest => dest.FrontBearingLastLubricant, opt => opt.Ignore())
            .ForMember(dest => dest.RearBearingLastLubricant, opt => opt.Ignore());
        CreateMap<LubricantType, LubricantTypeDto>();
        CreateMap<CreateLubricantTypeDto, LubricantType>();
        CreateMap<UpdateLubricantTypeDto, LubricantType>();
    }
}

/// <summary>
/// Вспомогательный метод для создания экземпляра IMapper с настройками из приложения
/// </summary>
public static class MapperHelper
{
    public static IMapper CreateMapper()
    {
        var config = new MapperConfiguration(
    cfg => cfg.AddProfile<Application.Mappings.MappingProfile>(),
    NullLoggerFactory.Instance // Передаем обязательный второй аргумент
);
       
        return config.CreateMapper();
    }
}