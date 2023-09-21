using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace WhichPharmaPortal.Models.Client
{
    [BsonIgnoreExtraElements]
    public class DBRFQCards {

        public string RfqNumber { get; set; }
        public List<RFQCards> Cards{ get; set; }


    }
}
