using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace WhichPharma.StandardTerms.Models
{
    public class Result<T>
    {

        [JsonPropertyName("count")]
        public int Count { get; set; }

        [JsonPropertyName("content")]
        public IEnumerable<T> Content { get; set; }

        [JsonPropertyName("last_update")]
        public DateTime? LastUpdate { get; set; }
    }
}
