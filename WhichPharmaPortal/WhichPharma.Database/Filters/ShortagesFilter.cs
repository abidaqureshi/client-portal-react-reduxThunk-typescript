using System;
using System.Collections.Generic;
using WhichPharma.Models.Products;

namespace WhichPharma.Database.Filters
{
    public class ShortagesFilter
    {
        public IEnumerable<string> Countries { get; set; }
        public IEnumerable<string> Origins { get; set; }
        public IEnumerable<ShortageType> Types { get; set; }
        public DateTime? StartFrom { get; set; }
        public DateTime? StartTo { get; set; }
        public DateTime? EndFrom { get; set; }
        public DateTime? EndTo { get; set; }
    }
}
