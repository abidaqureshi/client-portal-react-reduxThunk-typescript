namespace WhichPharma.Services.GoogleServices
{
    public interface IGoogleServiceConfig
    {
        string ServiceAccountCredentialsFile { get; set; }
        string ServiceAccountImpersonate { get; set; }
        string ApplicationCredentialsFile { get; set; }
        string DataStoreFolder { get; set; }
        string APIRedirectUrl { get; set; }
    }
}
