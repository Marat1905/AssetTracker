using AssetTracker.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssetTracker.Application.DTOs
{
    public class MoveMotorDto
    {
        public string NewLocation { get; set; } = string.Empty;
        public MotorStatus? NewStatus { get; set; }
    }
}
