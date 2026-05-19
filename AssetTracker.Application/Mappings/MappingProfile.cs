using AssetTracker.Application.DTOs;
using AssetTracker.Domain.Entities;
using AutoMapper;

namespace AssetTracker.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Маппинг для создания мотора (CreateMotorDto -> Motor)
        CreateMap<CreateMotorDto, Motor>()
            .ForMember(dest => dest.FrontBearing, opt => opt.Ignore())   // подшипники обрабатываются отдельно
            .ForMember(dest => dest.RearBearing, opt => opt.Ignore())
            .ForMember(dest => dest.FrontBearingId, opt => opt.Ignore())
            .ForMember(dest => dest.RearBearingId, opt => opt.Ignore());

        // Маппинг для обновления мотора (UpdateMotorDto -> Motor)
        CreateMap<UpdateMotorDto, Motor>();

        // Маппинг для подшипников
        CreateMap<CreateBearingDto, Bearing>();
        CreateMap<Bearing, BearingDto>();
        CreateMap<UpdateBearingDto, Bearing>();

        // Маппинг истории перемещений
        CreateMap<LocationHistory, LocationHistoryDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

        // Маппинг записей обслуживания
        CreateMap<MaintenanceLog, MaintenanceLogDto>()
            .ForMember(dest => dest.WorkType, opt => opt.MapFrom(src => src.WorkType.ToString()))
            .ForMember(dest => dest.BearingPosition, opt => opt.MapFrom(src => src.BearingPosition.HasValue ? src.BearingPosition.Value.ToString() : null))
            .ForMember(dest => dest.LubricantTypeName, opt => opt.MapFrom(src => src.LubricantType != null ? src.LubricantType.Name : null))
            .ForMember(dest => dest.OldBearing, opt => opt.MapFrom(src => src.OldBearing))
            .ForMember(dest => dest.NewBearing, opt => opt.MapFrom(src => src.NewBearing));

        // Маппинг полной истории двигателя
        CreateMap<Motor, MotorFullHistoryDto>()
            .ForMember(dest => dest.FrontBearing, opt => opt.MapFrom(src => src.FrontBearing))
            .ForMember(dest => dest.RearBearing, opt => opt.MapFrom(src => src.RearBearing))
            .ForMember(dest => dest.FrontBearingLastLubricant, opt => opt.Ignore())
            .ForMember(dest => dest.RearBearingLastLubricant, opt => opt.Ignore());

        // Маппинг типов смазки
        CreateMap<LubricantType, LubricantTypeDto>();
        CreateMap<CreateLubricantTypeDto, LubricantType>();
        CreateMap<UpdateLubricantTypeDto, LubricantType>();
    }
}