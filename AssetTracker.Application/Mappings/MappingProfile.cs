using AssetTracker.Application.DTOs;
using AssetTracker.Domain.Entities;
using AutoMapper;

namespace AssetTracker.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<CreateMotorDto, Motor>();
        CreateMap<LocationHistory, LocationHistoryDto>();
        CreateMap<MaintenanceLog, MaintenanceLogDto>()
            .ForMember(dest => dest.WorkType, opt => opt.MapFrom(src => src.WorkType.ToString()))
            .ForMember(dest => dest.BearingPosition, opt => opt.MapFrom(src => src.BearingPosition.HasValue ? src.BearingPosition.Value.ToString() : null))
            .ForMember(dest => dest.LubricantTypeName, opt => opt.MapFrom(src => src.LubricantType != null ? src.LubricantType.Name : null));

        CreateMap<UpdateMotorDto, Motor>();

        CreateMap<Motor, MotorFullHistoryDto>()
    .ForMember(dest => dest.FrontBearingLastLubricant, opt => opt.Ignore())
    .ForMember(dest => dest.RearBearingLastLubricant, opt => opt.Ignore());


        // Маппинги для LubricantType
        CreateMap<LubricantType, LubricantTypeDto>();
        CreateMap<CreateLubricantTypeDto, LubricantType>();
        CreateMap<UpdateLubricantTypeDto, LubricantType>();
    }
}