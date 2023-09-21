using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WhichPharma.Database.Filters;
using WhichPharma.Models.Database.Products;

namespace WhichPharma.Database.Services
{
    public interface IShortagesStorage
    {
        Task<(List<Shortage> Items, long Total)> GetShortagesAsync(ShortagesFilter filter, int offset, int pageSize, CancellationToken token = default);
    }
}
