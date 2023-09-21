using WhichPharmaPortal.Models.Client;

namespace WhichPharmaPortal.Extensions
{
    /// <summary>
    /// RFQQuote extensions
    /// </summary>
    public static class RFQQuoteInfoExtensions
    {
        /// <summary>
        /// This is used to add the creation date to the ID avoiding duplicated IDs in the frontend.
        /// As the ID is the product ID and we can have more than one RFQ for the same product.
        /// <para>Use <see cref="WithCompressedId(RFQQuote)"/> to reverse this operation.</para>
        /// </summary>
        public static RFQQuoteInfo WithExtendedId(this RFQQuoteInfo @this)
        {
            @this.Id = @this.Id + '-' + @this.CreationDate.ToString("yyyyMMddHHmmss"); 
            return @this;
        }

        /// <summary>
        /// Used to reverse the operation made with <see cref="WithExtendedId(RFQQuoteInfo)"/>.
        /// </summary>
        public static RFQQuote WithCompressedId(this RFQQuote @this)
        {
            @this.Id = @this.Id.Contains('-') ? @this.Id.Substring(0, @this.Id.IndexOf('-')) : @this.Id; 
            return @this;
        }
    }
}
