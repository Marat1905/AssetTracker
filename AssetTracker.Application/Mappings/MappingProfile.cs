using AssetTracker.Application.DTOs;
using AssetTracker.Domain.Entities;
using AutoMapper;

namespace AssetTracker.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<CreateMotorDto, Motor>()
            .ForMember(dest => dest.FrontBearingId, opt => opt.MapFrom(src => src.FrontBearingId))
            .ForMember(dest => dest.RearBearingId, opt => opt.MapFrom(src => src.RearBearingId));
        CreateMap<UpdateMotorDto, Motor>()
            .ForMember(dest => dest.FrontBearingId, opt => opt.MapFrom(src => src.FrontBearingId))
            .ForMember(dest => dest.RearBearingId, opt => opt.MapFrom(src => src.RearBearingId));

        CreateMap<LocationHistory, LocationHistoryDto>();
        CreateMap<MaintenanceLog, MaintenanceLogDto>()
            .ForMember(dest => dest.WorkType, opt => opt.MapFrom(src => src.WorkType.ToString()))
            .ForMember(dest => dest.BearingPosition, opt => opt.MapFrom(src => src.BearingPosition.HasValue ? src.BearingPosition.Value.ToString() : null))
            .ForMember(dest => dest.LubricantTypeName, opt => opt.MapFrom(src => src.LubricantType != null ? src.LubricantType.Name : null))
            .ForMember(dest => dest.OldBearingType, opt => opt.MapFrom(src => src.OldBearing != null ? src.OldBearing.Type : null))
            .ForMember(dest => dest.NewBearingType, opt => opt.MapFrom(src => src.NewBearing != null ? src.NewBearing.Type : null));

        CreateMap<Motor, MotorFullHistoryDto>()
            .ForMember(dest => dest.FrontBearingLastLubricant, opt => opt.Ignore())
            .ForMember(dest => dest.RearBearingLastLubricant, opt => opt.Ignore())
            .ForMember(dest => dest.FrontBearingType, opt => opt.Ignore())
            .ForMember(dest => dest.RearBearingType, opt => opt.Ignore())
            .ForMember(dest => dest.FrontBearingManufacturer, opt => opt.Ignore())
            .ForMember(dest => dest.RearBearingManufacturer, opt => opt.Ignore())
            .ForMember(dest => dest.FrontBearingSupplier, opt => opt.Ignore())
            .ForMember(dest => dest.RearBearingSupplier, opt => opt.Ignore());

        // Маппинги для LubricantType
        CreateMap<LubricantType, LubricantTypeDto>();
        CreateMap<CreateLubricantTypeDto, LubricantType>();
        CreateMap<UpdateLubricantTypeDto, LubricantType>();

        // Маппинги для Bearing
        CreateMap<Bearing, BearingDto>();
        CreateMap<CreateBearingDto, Bearing>();
        CreateMap<UpdateBearingDto, Bearing>();
    }
}