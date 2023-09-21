using System;

namespace WhichPharmaPortal.Models.Client
{

    public class HarmonizedPform2
    {
        public string Country { get; set; }
        public string Original { get; set; }
        public string User { get; set; }
        public bool Closed { get; set; } = false;
        public DateTime? Updated { get; set; }
        public string Final { get; set; }
        public string Translated { get; set; }
        public string[] Alternatives { get; set; }
    }

    [MongoDB.Bson.Serialization.Attributes.BsonIgnoreExtraElements]
    public class HarmonizedPform
    {
        public string Country { get; set; }
        public string Original { get; set; }
        public string User { get; set; }
        public bool Closed { get; set; } = false;
        public DateTime? Updated { get; set; }
        public string[] Final{ get; set; }
        public string Translated { get; set; }
    }
}
