using System;

namespace WhichPharma.Services.Extensions
{
    public static class ObjectExtensions
    {
        public static T Then<T>(this T @this, Action<T> func)
        {
            func(@this);
            return @this;
        }
    }
}
