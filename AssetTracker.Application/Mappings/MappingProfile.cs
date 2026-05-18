using AssetTracker.Application.DTOs;
using AssetTracker.Domain.Entities;
using AutoMapper;

namespace AssetTracker.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Маппинг создания двигателя
        CreateMap<CreateMotorDto, Motor>()
            .ForMember(dest => dest.FrontBearingId, opt => opt.Ignore())
            .ForMember(dest => dest.RearBearingId, opt => opt.Ignore())
            .ForMember(dest => dest.FrontBearing, opt => opt.Ignore())
            .ForMember(dest => dest.RearBearing, opt => opt.Ignore());

        CreateMap<UpdateMotorDto, Motor>()
            .ForMember(dest => dest.FrontBearingId, opt => opt.Ignore())
            .ForMember(dest => dest.RearBearingId, opt => opt.Ignore())
            .ForMember(dest => dest.FrontBearing, opt => opt.Ignore())
            .ForMember(dest => dest.RearBearing, opt => opt.Ignore());

        // Маппинг подшипников
        CreateMap<CreateBearingDto, Bearing>();
        CreateMap<BearingInfoDto, Bearing>();
        CreateMap<Bearing, BearingDto>();

        // Маппинг Motor -> MotorFullHistoryDto (остальные поля заполняются вручную в сервисе)
        CreateMap<Motor, MotorFullHistoryDto>()
            .ForMember(dest => dest.FrontBearing, opt => opt.MapFrom(src => src.FrontBearing))
            .ForMember(dest => dest.RearBearing, opt => opt.MapFrom(src => src.RearBearing))
            .ForMember(dest => dest.FrontBearingLastLubricant, opt => opt.Ignore())
            .ForMember(dest => dest.RearBearingLastLubricant, opt => opt.Ignore())
            .ForMember(dest => dest.LocationHistory, opt => opt.Ignore())
            .ForMember(dest => dest.MaintenanceLogs, opt => opt.Ignore());

        // Маппинг MaintenanceLog -> MaintenanceLogDto
        CreateMap<MaintenanceLog, MaintenanceLogDto>()
            .ForMember(dest => dest.WorkType, opt => opt.MapFrom(src => src.WorkType.ToString()))
            .ForMember(dest => dest.BearingPosition, opt => opt.MapFrom(src => src.BearingPosition.HasValue ? src.BearingPosition.Value.ToString() : null))
            .ForMember(dest => dest.LubricantTypeName, opt => opt.MapFrom(src => src.LubricantType != null ? src.LubricantType.Name : null))
            .ForMember(dest => dest.OldBearingId, opt => opt.MapFrom(src => src.OldBearingId))
            .ForMember(dest => dest.OldBearingType, opt => opt.MapFrom(src => src.OldBearing != null ? src.OldBearing.Type : null))
            .ForMember(dest => dest.NewBearingId, opt => opt.MapFrom(src => src.NewBearingId))
            .ForMember(dest => dest.NewBearingType, opt => opt.MapFrom(src => src.NewBearing != null ? src.NewBearing.Type : null));

        // Маппинг LocationHistory -> LocationHistoryDto
        CreateMap<LocationHistory, LocationHistoryDto>();

        // LubricantType маппинги
        CreateMap<LubricantType, LubricantTypeDto>();
        CreateMap<CreateLubricantTypeDto, LubricantType>();
        CreateMap<UpdateLubricantTypeDto, LubricantType>();
    }
}