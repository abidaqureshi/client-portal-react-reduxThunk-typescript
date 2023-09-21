using System;
using System.Threading;
using System.Threading.Tasks;

namespace WhichPharma.Queue
{
    public interface IQueueClient : IDisposable
    {
        Task WaitForConfirmsAsync(CancellationToken token);
        void PublishProductMappingChanged(string origin, string[] valuesAffected);
    }
}
