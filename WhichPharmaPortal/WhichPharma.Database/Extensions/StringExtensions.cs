using System;
using System.Net.Mail;

namespace WhichPharma.Database.Extensions
{
    public static class StringExtensions
    {
        public static bool IsValidEmail(this string @this)
        {
            try
            {
                var _ = new MailAddress(@this);
                return true;
            }
            catch (FormatException)
            {
                return false;
            }
        }
    }
}
