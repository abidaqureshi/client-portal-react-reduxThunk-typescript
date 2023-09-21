using MongoDB.Bson.Serialization.Attributes;
using System;

namespace WhichPharmaPortal.Models.Client
{
    [BsonIgnoreExtraElements]
    public class HarmonizedATC
    {
        public string User { get; set; }
        public string ATCCode { get; set; }
        public string Description { get; set; }
        public bool Closed { get; set; } = false;
        public DateTime? Updated { get; set; }

    }
}
