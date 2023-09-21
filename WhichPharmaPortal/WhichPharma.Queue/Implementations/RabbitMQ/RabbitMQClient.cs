using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using RabbitMQ.Client;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Models.Queue.Events;

namespace WhichPharma.Queue.Implementations.RabbitMQ
{
    public class RabbitMQClient : IQueueClient
    {
        private readonly ConnectionFactory _connectionFactory;
        private readonly RabbitMQClientConfig _config;
        private IConnection _connection;
        private IModel _channel;

        private static JsonSerializerSettings _jsonSettings = new JsonSerializerSettings
        {
            NullValueHandling = NullValueHandling.Ignore,
            Converters = new List<JsonConverter>
            {
                new StringEnumConverter(),
            },
        };

        public RabbitMQClient(RabbitMQClientConfig config)
        {
            _connectionFactory = new ConnectionFactory
            {
                HostName = config.Hostname,
                UserName = config.Username,
                Password = config.Password,
            };
            _config = config;

            OpenChannel();
        }

        public void Dispose()
        {
            CloseChannel();
            if (_connection?.IsOpen ?? false) _connection.Close();
        }

        public void OpenChannel()
        {
            if (!(_connection?.IsOpen ?? false))
            {
                _connection = _connectionFactory.CreateConnection();
            }
            var channel = _connection.CreateModel();

            channel.ExchangeDeclare(exchange: _config.ProductsExchange,
                                    type: "topic",
                                    durable: true,
                                    autoDelete: false);

            channel.ConfirmSelect();

            _channel = channel;
        }

        public void CloseChannel()
        {
            if (_channel?.IsOpen ?? false) _channel.Close();
        }

        public Task WaitForConfirmsAsync(CancellationToken token)
        {
            if (token.IsCancellationRequested) return Task.CompletedTask;
            _channel.WaitForConfirmsOrDie(new TimeSpan(0, 0, 60));
            return Task.CompletedTask;
        }

        public void PublishProductMappingChanged(string origin, string[] valuesAffected)
        {
            var data = new ProductMappingChanged
            {
                Origin = origin,
                ValuesAffected = valuesAffected,
            };

            _channel.BasicPublish(exchange: _config.ProductsExchange,
                                 routingKey: _config.TopicProductMappingChanged,
                                 basicProperties: null,
                                 body: Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(data, _jsonSettings)));
        }
    }
}
