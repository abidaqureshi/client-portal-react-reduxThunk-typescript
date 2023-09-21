using System;
using WhichPharmaPortal.Models.Client;

namespace WhichPharma.Services.RFQs.Exceptions
{
    public class RFQCreationException : Exception
    {
        public RFQCreationException(RFQCreationError error, string msg = default) : base(msg ?? error.ToString())
        {
            Error = error;
        }

        public RFQCreationError Error { get; }
    }
}
