using System.Threading.Tasks;

namespace WhichPharma.Utils
{
    public static class Tasks
    {
        public static async Task<(T1, T2)> WhenAll<T1,T2>(Task<T1> t1, Task<T2> t2) => (await t1, await t2);
        public static async Task<(T1, T2, T3)> WhenAll<T1, T2, T3>(Task<T1> t1, Task<T2> t2, Task<T3> t3) => (await t1, await t2, await t3);
    }
}
