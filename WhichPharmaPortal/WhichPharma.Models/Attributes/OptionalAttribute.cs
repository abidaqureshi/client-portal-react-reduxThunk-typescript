using System;

namespace WhichPharma.Models.Attributes
{
    [AttributeUsage(AttributeTargets.All, Inherited = false, AllowMultiple = true)]
    public class OptionalAttribute : Attribute
    {
    }
}
