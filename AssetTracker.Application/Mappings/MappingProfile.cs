using AssetTracker.Application.DTOs;
using AssetTracker.Domain.Entities;
using AutoMapper;

namespace AssetTracker.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<CreateMotorDto, Motor>();
            CreateMap<Motor, MotorFullHistoryDto>();
            CreateMap<LocationHistory, LocationHistoryDto>();
            CreateMap<MaintenanceLog, MaintenanceLogDto>()
                .ForMember(dest => dest.WorkType, opt => opt.MapFrom(src => src.WorkType.ToString()));
        }
    }
}
