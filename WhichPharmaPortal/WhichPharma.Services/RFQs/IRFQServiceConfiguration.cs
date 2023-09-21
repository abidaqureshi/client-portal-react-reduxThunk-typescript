namespace WhichPharma.Services.RFQs
{
    public interface IRFQServiceConfiguration
    {
        bool Testing { get; }
        string[] CC { get; }
        string ReplyFormUrlBase { get; }
    }
}
