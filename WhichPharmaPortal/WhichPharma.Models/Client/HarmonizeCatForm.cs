using MongoDB.Bson.Serialization.Attributes;
using System;

namespace WhichPharmaPortal.Models.Client
{

    [BsonIgnoreExtraElements]
    public class HarmonizeCatForm
    {
        public string Category
        {
            get;
            set;
        }

        public string SubCategory
        {
            get;
            set;
        }

        public string PharmaceuticalPhorm
        {
            get;
            set;
        }

        public string AdministrationRoute
        {
            get;
            set;
        }

        public DateTime Updated
        {
            get;
            set;
        }

        public string User
        {
            get;
            set;
        }

        public bool Closed
        {
            get;
            set;
        }
    }
}
