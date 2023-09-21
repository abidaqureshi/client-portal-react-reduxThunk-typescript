namespace WhichPharmaPortal.Models.Client
{
    public class Email
    {
        public string[] To { get; set; }
        public string[] Cc { get; set; }
        public string Body { get; set; }
        public string Subject { get; set; }
        public string ExecutionId { get; set; }
    }
}
