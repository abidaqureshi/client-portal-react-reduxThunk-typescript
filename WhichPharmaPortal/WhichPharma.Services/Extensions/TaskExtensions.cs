using System;
using System.Threading.Tasks;

namespace WhichPharma.Services.Extensions
{
    public static class TaskExtensions
    {
        /// <summary>
        /// Run task handling all exception. 
        /// <para>Returns true if the task thrown an exception, false otherwise.</para>
        /// </summary>
        public static Task<bool> HandleExceptions(this Task @this, Action<Exception> onException = null)
        {
            return @this.ContinueWith(t => 
            {
                if (t.IsFaulted) 
                {
                    onException?.Invoke(t.Exception);
                }
                return t.IsFaulted;
            });
        }

        /// <summary>
        /// Run task handling all exception. 
        /// <para>Returns a tupple containing the task result and a boolean which is true if the task thrown an exception, false otherwise.</para>
        /// </summary>
        public static Task<(T Result, bool ExceptionThrown)> HandleExceptions<T>(this Task<T> @this, Action<Exception> onException = null)
        {
            return @this.ContinueWith(t =>
            {
                if (t.IsFaulted)
                {
                    onException?.Invoke(t.Exception);
                    return (default(T), true);
                }
                return (t.Result, false);
            });
        }
    }
}
