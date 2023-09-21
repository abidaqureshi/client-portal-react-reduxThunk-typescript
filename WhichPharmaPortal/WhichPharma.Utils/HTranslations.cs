using System;

namespace WhichPharma.Utils
{
    public static class HTranslations
    {
        public static string GetSirMadam(string countryCode) => countryCode switch
        {
            "PT" => "Sr./Sra.",
            _ => "Sir/Madam",
        };

        public static string GetThankyouForYourQuote(string countryCode) => countryCode switch
        {
            "PT" => "Obrigado pela sua proposta",
            _ => "Thank you for your quote",
        };
    }
}
