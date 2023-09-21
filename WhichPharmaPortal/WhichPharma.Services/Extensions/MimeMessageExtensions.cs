using MimeKit;
using System.IO;

namespace WhichPharma.Services.Extensions
{
    public static class MimeMessageExtensions
    {
        public static string Encode(this MimeMessage @this)
        {
            using(var stream = new MemoryStream())
            {
                @this.WriteTo(stream);
                stream.Position = 0;

                var bytes = new byte[stream.Length];
                stream.Read(bytes);

                return System.Convert.ToBase64String(bytes)
                    .Replace('+', '-')
                    .Replace('/', '_')
                    .Replace("=", "");
            }
        }
    }
}
