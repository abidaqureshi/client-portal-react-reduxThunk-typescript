using System;
using WhichPharma.Models.Database.RFQs;

namespace WhichPharma.Services.Extensions
{
    public static class RFQQuoteExtensions
    {
        public static RFQQuote CreatedBy(this RFQQuote @this, string username) => @this.Then(quote =>
        {
            quote.CreatedBy = username;
            quote.CreationDate = DateTime.UtcNow;
        });

        public static RFQQuote UpdatedBy(this RFQQuote @this, string username) => @this.Then(quote =>
        {
            quote.UpdatedBy = username;
            quote.LastUpdateDate = DateTime.UtcNow;
        });
    }
}
