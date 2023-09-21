using System;
using WhichPharma.Models.Attributes;

namespace WhichPharmaPortal.Models.Client
{
    public class ProductV1
    {
        public string Id { get; set; }
        public string Country { get; set; }
        public string CountryCode { get; set; }
        public string ScrapingOrigin { get; set; }
        public long ScrapingOriginId { get; set; }
        [Optional]
        public string ScrapingOriginUrl { get; set; }
        public DateTime? LastUpdate { get; set; }
        public string Name { get; set; }
        public string[] ActiveSubstances { get; set; }
        public string ATC { get; set; }
        [Optional] 
        public string DrugForm { get; set; }
        [Optional]
        public string AdministrationForm { get; set; }
        [Optional]
        public string ProductCode { get; set; }
        [Optional]
        public string Manufacturer { get; set; }
        [Optional]
        public string Strength { get; set; }
        [Optional]
        public string Package { get; set; }
        [Optional]
        public string MANumber { get; set; }
        [Optional]
        public string MAHolder { get; set; }
        [Optional]
        public ProductStatus Status { get; set; }
        [Optional]
        public string SPCFileUrl { get; set; }
        [Optional]
        public string PILFileUrl { get; set; }
        [Optional]
        public string LabelFileUrl { get; set; }
        [Optional]
        public string[] DocumentsUrls { get; set; }
        [Optional]
        public decimal? RetailPrice { get; set; }
        [Optional]
        public decimal? ReimbursementPrice { get; set; }
        [Optional]
        public decimal? WholesalePrice { get; set; }
        [Optional]
        public decimal? FactoryPrice { get; set; }
        [Optional]
        public decimal? ExFactoryPrice { get; set; }
        [Optional]
        public decimal? RetailPriceWithVat { get; set; }
        [Optional]
        public decimal? ReimbursementPriceWithVat { get; set; }
        [Optional]
        public decimal? WholesalePriceWithVat { get; set; }
        [Optional]
        public decimal? FactoryPriceWithVat { get; set; }
        [Optional]
        public decimal? ExFactoryPriceWithVat { get; set; }
        [Optional]
        public string CurrencyCode { get; set; }
        [Optional]
        public ShortageInfo ShortageInfo { get; set; }
        [Optional]
        public string Notes { get; set; }
        [Optional]
        public string[] AdministrationFormCategories { get; set; }
        [Optional]
        public string[] DrugFormCategories { get; set; }
    }
}
