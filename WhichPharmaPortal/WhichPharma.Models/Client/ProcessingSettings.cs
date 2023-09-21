using System.Collections.Generic;

namespace WhichPharmaPortal.Models.Client
{
    public class ProcessingSettings
    {
        public string Culture { get; set; }
        public string DecimalSeparator { get; set; }
        public string NumberGroupSeparator { get; set; }
        public IDictionary<string, string[]> AdministrationFormsMap { get; set; }
        public IDictionary<string, string[]> DrugFormsMap { get; set; }
        public IDictionary<string, string[]> PharmaUnitsMap { get; set; }
        public string[] AdministrationFormPresenceFields { get; set; }
        public string[] DrugFormPresenceFields { get; set; }
        public string[] StrengthPresenceFields { get; set; }
        public string[] PackagePresenceFields { get; set; }
        public Dictionary<string, HarmonizedPform> DrugFormsMap2 { get; set; }
        public Dictionary<string, HarmonizeCatForm> CatsMap { get; set; }
        public Dictionary<string, HarmonizedPform> DciMap { get; set; }
        public Dictionary<string, HarmonizedATC> ATCMap { get; set; }
    }
}
