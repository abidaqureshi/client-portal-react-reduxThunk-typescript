using MongoDB.Driver;
using System;
using System.Linq.Expressions;

namespace WhichPharma.Database.Utils
{
    public class DynamicUpdateBuilder<T>
    {
        private UpdateDefinition<T> UpdateDefinition { get; set; }
        public UpdateDefinition<T> Build() => UpdateDefinition;

        public DynamicUpdateBuilder<T> SetIfNotNull<TField>(Expression<Func<T, TField>> field, TField value)
        {
            if (value != null)
            {
                Set(field, value);
            }
            return this;
        }

        public DynamicUpdateBuilder<T> SetIf<TField>(Expression<Func<T, TField>> field, TField value, bool condition)
        {
            if (condition)
            {
                Set(field, value);
            }
            return this;
        }

        public DynamicUpdateBuilder<T> Set<TField>(Expression<Func<T, TField>> field, TField value)
        {
            UpdateDefinition = UpdateDefinition == null
                ? Builders<T>.Update.Set(field, value)
                : UpdateDefinition.Set(field, value);
            return this;
        }

    }
}
