using System;
using System.Collections.Generic;
using System.Linq;
using WhichPharma.Models.Products;

namespace WhichPharma.StandardTerms.Models
{
    public class TermsMappings
    {
        public TermsMappings()
        {
            AdministrationMap = Enum.GetValues(typeof(Administration)).Cast<Administration>()
                .ToDictionary(a => a, _ => new List<string>() as IList<string>);
            PharmaceuticalFormMap = Enum.GetValues(typeof(PharmaceuticalForm)).Cast<PharmaceuticalForm>()
                .ToDictionary(a => a, _ => new List<string>() as IList<string>);
        }

        public IDictionary<Administration, IList<string>> AdministrationMap { get; set; }
        public IDictionary<PharmaceuticalForm, IList<string>> PharmaceuticalFormMap { get; set; }
    }
}
