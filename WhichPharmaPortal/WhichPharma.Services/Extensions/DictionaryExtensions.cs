using System.Collections.Generic;
using System.Linq;

namespace WhichPharma.Services.Extensions
{
    public static class DictionaryExtensions
    {
        public static IEnumerable<V> GetOrEmpty<K, V>(this IDictionary<K, V[]> @this, K key)
        {
            if(@this.TryGetValue(key, out var v))
            {
                return v;
            }
            return Enumerable.Empty<V>();
        }
    }
}
