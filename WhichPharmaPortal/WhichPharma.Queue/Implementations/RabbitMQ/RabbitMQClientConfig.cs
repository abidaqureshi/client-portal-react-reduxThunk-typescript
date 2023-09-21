namespace WhichPharma.Queue.Implementations.RabbitMQ
{
    public class RabbitMQClientConfig
    {
        public string Hostname { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string ProductsExchange { get; set; }
        public string TopicProductMappingChanged { get; set; }
    }
}
