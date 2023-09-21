using WhichPharma.Services.GoogleServices;

namespace WhichPharmaPortal.Config.Services
{
    /// <summary>
    /// Email service configuration
    /// </summary>
    public class GoogleServiceConfig : IGoogleServiceConfig
    {
        /// <summary>
        /// Path to Google Service Account credentials JSON file generated in Google Console
        /// </summary>
        public string ServiceAccountCredentialsFile { get; set; }
        /// <summary>
        /// Gmail account which Service Account will impersonate (e.g. to send e-mails)
        /// </summary>
        public string ServiceAccountImpersonate { get; set; }
        /// <summary>
        /// Path to Google credentials JSON file
        /// </summary>
        public string ApplicationCredentialsFile { get; set; }
        /// <summary>
        /// Folder used to store Gmail client tokens
        /// </summary>
        public string DataStoreFolder { get; set; }
        /// <summary>
        /// Redirect URL validated by google when getting token
        /// </summary>
        public string APIRedirectUrl { get; set; }
    }
}
