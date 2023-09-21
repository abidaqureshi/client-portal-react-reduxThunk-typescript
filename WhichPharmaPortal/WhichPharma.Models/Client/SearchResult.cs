using System.Collections.Generic;

namespace WhichPharmaPortal.Models.Client
{
    public class SearchResult<T>
    {
        public IList<T> Items { get; set; }
        public int Total { get; set; }
    }
}
