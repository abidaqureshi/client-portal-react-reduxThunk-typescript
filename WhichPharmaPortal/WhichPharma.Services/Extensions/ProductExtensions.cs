using System;
using WhichPharmaPortal.Models.Client;

namespace WhichPharma.Services.Extensions
{
    public static class ProductExtensions
    {
        public static ProductV1 AdaptStatusWithShortage(this ProductV1 @this, DateTime start, DateTime? end, ShortageType type)
        {
            if (start.Date <= DateTime.UtcNow && (end?.Date ?? DateTime.MaxValue) >= DateTime.UtcNow)
            {
                @this.Status = type switch
                {
                    ShortageType.Permanent => ProductStatus.Discontinued,
                    ShortageType.Partial => ProductStatus.PartialShortage,
                    ShortageType.Temporary => ProductStatus.Shortage,
                    _ => @this.Status,
                };
            }

            return @this;
        }
    }
}
