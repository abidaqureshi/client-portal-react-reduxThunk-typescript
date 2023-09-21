using System;

namespace WhichPharma.Utils.Exceptions
{
    public class InvalidParameterException : ArgumentException
    {
        public InvalidParameterException(string message, string paramName) : base(message, paramName) { }
    }
}
