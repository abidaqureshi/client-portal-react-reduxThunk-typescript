using System;
using System.Text.RegularExpressions;

namespace WhichPharma.Utils.Extensions
{
    public static class StringExtensions
    {
        public static string Replace(this string @this, string oldValue, Func<string> newValue)
        {
            return @this.Contains(oldValue)
                ? @this.Replace(oldValue, newValue())
                : @this;
        }

        public static string CamelCaseToPretty(this string @this)
        {
            return Regex.Replace(
                Regex.Replace(
                    @this,
                    @"(\P{Ll})(\P{Ll}\p{Ll})",
                    "$1 $2"
                ),
                @"(\p{Ll})(\P{Ll})",
                "$1 $2"
            );
        }

        public static int IndexOfNth(this string input, char value, int startIndex, int nth)
        {
            if (nth < 1) throw new NotSupportedException("Param 'nth' must be greater than 0!");
            if (nth == 1) return input.IndexOf(value, startIndex);
            var idx = input.IndexOf(value, startIndex);
            if (idx == -1) return -1;
            return input.IndexOfNth(value, idx + 1, --nth);
        }

        public static int IndexOfNth(this string input, string value, int startIndex, int nth)
        {
            if (nth < 1) throw new NotSupportedException("Param 'nth' must be greater than 0!");
            if (nth == 1) return input.IndexOf(value, startIndex);
            var idx = input.IndexOf(value, startIndex);
            if (idx == -1) return -1;
            return input.IndexOfNth(value, idx + 1, --nth);
        }
    }
}
