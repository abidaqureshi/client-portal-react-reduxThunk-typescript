using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WhichPharma.Utils.Extensions
{
    public static class TaskLinqExtensions
    {
        public static async Task<V> SelectMany<T, U, V>(
            this Task<T> source, Func<T, Task<U>> selector, Func<T, U, V> resultSelector)
        {
            T t = await source;
            U u = await selector(t);
            return resultSelector(t, u);
        }

        public static async Task<U> Select<T, U>(
            this Task<T> source, Func<T, U> selector)
        {
            T t = await source;
            return selector(t);
        }

        public static async Task<T> Where<T>(
            this Task<T> source, Func<T, bool> predicate)
        {
            T t = await source;
            if (!predicate(t)) throw new OperationCanceledException();
            return t;
        }

        public static async Task<V> Join<T, U, K, V>(
            this Task<T> source, Task<U> inner,
            Func<T, K> outerKeySelector, Func<U, K> innerKeySelector,
            Func<T, U, V> resultSelector)
        {
            await Task.WhenAll(source, inner);
            if (!EqualityComparer<K>.Default.Equals(
                outerKeySelector(source.Result), innerKeySelector(inner.Result)))
                throw new OperationCanceledException();
            return resultSelector(source.Result, inner.Result);
        }

        public static async Task<V> GroupJoin<T, U, K, V>(
            this Task<T> source, Task<U> inner,
            Func<T, K> outerKeySelector, Func<U, K> innerKeySelector,
            Func<T, Task<U>, V> resultSelector)
        {
            T t = await source;
            return resultSelector(t,
                inner.Where(u => EqualityComparer<K>.Default.Equals(
                    outerKeySelector(t), innerKeySelector(u))));
        }

        public static async Task<T> Cast<T>(this Task source)
        {
            await source;
            return (T)((dynamic)source).Result;
        }

        public static async Task<T> Then<T>(this Task<T> source, Action<T> action)
        {
            T t = await source;
            action(t);
            return t;
        }
    }
}
