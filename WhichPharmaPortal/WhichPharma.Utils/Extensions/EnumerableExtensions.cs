using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace WhichPharma.Utils.Extensions
{
    public static class EnumerableExtensions
    {
        public static IEnumerable<T> IfEmpty<T>(this IEnumerable<T> @this, IEnumerable<T> valueIfEmpty) => @this?.Any() ?? false ? @this : valueIfEmpty;
    }
}
