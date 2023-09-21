using System;

namespace WhichPharmaPortal.Models.Client
{
    public class Supplier
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public SupplierType Type { get; set; }
        public string Country { get; set; }
        public string CountryCode { get; set; }
        public bool IsEurope { get; set; }
        public int Classification { get; set; }
        public string Notes { get; set; }
        public Contact[] Contacts { get; set; }
        public SupplierState State { get; set; }
        public DateTime LastVerification { get; set; }
        public DateTime ExpirationDate { get; set; }
        public DateTime CreationDate { get; set; }
    }
}
