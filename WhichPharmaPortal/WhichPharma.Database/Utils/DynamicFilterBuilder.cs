using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text.RegularExpressions;

namespace WhichPharma.Database.Utils
{
    public class DynamicFilterBuilder<T>
    {
        private IList<FilterDefinition<T>> _filterDefinition = new List<FilterDefinition<T>>();

        #region Add condition

        public DynamicFilterBuilder<T> Custom(FilterDefinition<T> custom)
        {
            _filterDefinition.Add(custom);
            return this;
        }

        public DynamicFilterBuilder<T> GreaterThan<TField>(Expression<Func<T, TField>> field, TField value)
        {
            _filterDefinition.Add(Builders<T>.Filter.Gt(field, value));
            return this;
        }

        public DynamicFilterBuilder<T> LessThan<TField>(Expression<Func<T, TField>> field, TField value)
        {
            _filterDefinition.Add(Builders<T>.Filter.Lt(field, value));
            return this;
        }

        public DynamicFilterBuilder<T> GreaterOrEqualThan<TField>(Expression<Func<T, TField>> field, TField value)
        {
            _filterDefinition.Add(Builders<T>.Filter.Gt(field, value));
            return this;
        }

        public DynamicFilterBuilder<T> LessOrEqualThan<TField>(Expression<Func<T, TField>> field, TField value)
        {
            _filterDefinition.Add(Builders<T>.Filter.Lt(field, value));
            return this;
        }

        public DynamicFilterBuilder<T> NotEqual<TField>(Expression<Func<T, TField>> field, TField value)
        {
            _filterDefinition.Add(Builders<T>.Filter.Ne(field, value));
            return this;
        }

        public DynamicFilterBuilder<T> NotEqual<TField>(Expression<Func<T, TField>> field, IEnumerable<TField> possibleValues)
        {
            _filterDefinition.Add(Builders<T>.Filter.Nin(field, possibleValues));
            return this;
        }

        public DynamicFilterBuilder<T> Equal<TField>(Expression<Func<T, TField>> field, TField value)
        {
            _filterDefinition.Add(Builders<T>.Filter.Eq(field, value));
            return this;
        }

        public DynamicFilterBuilder<T> Equal<TField>(Expression<Func<T, TField>> field, IEnumerable<TField> possibleValues)
        {
            _filterDefinition.Add(Builders<T>.Filter.In(field, possibleValues));
            return this;
        }

        public DynamicFilterBuilder<T> Contains(Expression<Func<T, object>> field, string value)
        {
            _filterDefinition.Add(Builders<T>.Filter.Regex(field, new BsonRegularExpression($".*{Regex.Escape(value)}.*", "i")));
            return this;
        }

        public DynamicFilterBuilder<T> ContainsAll(Expression<Func<T, object>> field, IEnumerable<string> values)
        {
            _filterDefinition.Add(Builders<T>.Filter.And(values.Select(value =>
                Builders<T>.Filter.Regex(field, new BsonRegularExpression($".*{Regex.Escape(value)}.*", "i")))));
            return this;
        }

        public DynamicFilterBuilder<T> NotContains(Expression<Func<T, object>> field, string value)
        {
            _filterDefinition.Add(Builders<T>.Filter.Regex(field, new BsonRegularExpression($"(?!.*{Regex.Escape(value)}.*)", "i")));
            return this;
        }

        public DynamicFilterBuilder<T> NotContainsAll(Expression<Func<T, object>> field, IEnumerable<string> values)
        {
            _filterDefinition.Add(Builders<T>.Filter.And(values.Select(value =>
                Builders<T>.Filter.Regex(field, new BsonRegularExpression($"(?!.*{Regex.Escape(value)}.*)", "i")))));
            return this;
        }

        public DynamicFilterBuilder<T> ArrayIncludesAll<TItem>(Expression<Func<T, IEnumerable<TItem>>> field, IEnumerable<TItem> values)
        {
            _filterDefinition.Add(Builders<T>.Filter.All(field, values));
            return this;
        }

        #endregion

        #region Add conditions IF

        public DynamicFilterBuilder<T> CustomIf(FilterDefinition<T> custom, bool condition)
        {
            if (condition) Custom(custom);
            return this;
        }

        public DynamicFilterBuilder<T> NotEqualIf<TField>(Expression<Func<T, TField>> field, TField value, bool condition)
        {
            if (condition) NotEqual(field, value);
            return this;
        }

        public DynamicFilterBuilder<T> NotEqualIf<TField>(Expression<Func<T, TField>> field, IEnumerable<TField> possibleValues, bool condition)
        {
            if (condition) NotEqual(field, possibleValues);
            return this;
        }

        public DynamicFilterBuilder<T> EqualIf<TField>(Expression<Func<T, TField>> field, TField value, bool condition)
        {
            if (condition) Equal(field, value);
            return this;
        }

        public DynamicFilterBuilder<T> EqualIf<TField>(Expression<Func<T, TField>> field, IEnumerable<TField> possibleValues, bool condition)
        {
            if (condition) Equal(field, possibleValues);
            return this;
        }

        public DynamicFilterBuilder<T> ContainsIf(Expression<Func<T, object>> field, string value, bool condition)
        {
            if (condition) Contains(field, value);
            return this;
        }

        public DynamicFilterBuilder<T> ContainsAllIf(Expression<Func<T, object>> field, IEnumerable<string> values, bool condition)
        {
            if (condition) ContainsAll(field, values);
            return this;
        }

        public DynamicFilterBuilder<T> NotContainsIf(Expression<Func<T, object>> field, string value, bool condition)
        {
            if (condition) NotContains(field, value);
            return this;
        }

        public DynamicFilterBuilder<T> NotContainsAllIf(Expression<Func<T, object>> field, IEnumerable<string> values, bool condition)
        {
            if (condition) NotContainsAll(field, values);
            return this;
        }

        public DynamicFilterBuilder<T> ExistIf<TField>(Expression<Func<T, TField>> p ,string fName, bool condition)
        {
            if (condition)
            {
                _filterDefinition.Add(Builders<T>.Filter.Exists(fName));
            }
            return this;
            //throw new NotImplementedException();
        }

        public DynamicFilterBuilder<T> ArrayIncludesAllIf<TItem>(Expression<Func<T, IEnumerable<TItem>>> field, IEnumerable<TItem> values, bool condition)
        {
            if (condition) ArrayIncludesAll(field, values);
            return this;
        }

        public DynamicFilterBuilder<T> GreaterThanIf<TField>(Expression<Func<T, TField>> field, TField value, bool condition)
        {
            if (condition) GreaterThan(field, value);
            return this;
        }

        public DynamicFilterBuilder<T> LessOrEqualThanIf<TField>(Expression<Func<T, TField>> field, TField value, bool condition)
        {
            if (condition) LessOrEqualThan(field, value);
            return this;
        }

        public DynamicFilterBuilder<T> GreaterOrEqualThanIf<TField>(Expression<Func<T, TField>> field, TField value, bool condition)
        {
            if (condition) GreaterOrEqualThan(field, value);
            return this;
        }

        public DynamicFilterBuilder<T> LessThanIf<TField>(Expression<Func<T, TField>> field, TField value, bool condition)
        {
            if (condition) LessThan(field, value);
            return this;
        }

        #endregion

        #region Add condition IF NOT NULL

        public DynamicFilterBuilder<T> CustomIfNotNull(FilterDefinition<T> custom) => CustomIf(custom, custom != null);
        public DynamicFilterBuilder<T> EqualIfNotNull<TField>(Expression<Func<T, TField>> field, TField value) => EqualIf(field, value, value != null);
        public DynamicFilterBuilder<T> EqualIfNotNull<TField>(Expression<Func<T, TField>> field, IEnumerable<TField> values) => EqualIf(field, values, values != null);
        public DynamicFilterBuilder<T> ContainsIfNotNull(Expression<Func<T, object>> field, string value) => ContainsIf(field, value, value != null);
        public DynamicFilterBuilder<T> ContainsAllIfNotNull(Expression<Func<T, object>> field, IEnumerable<string> values) => ContainsAllIf(field, values, values != null);
        public DynamicFilterBuilder<T> NotEqualIfNotNull<TField>(Expression<Func<T, TField>> field, TField value) => NotEqualIf(field, value, value != null);
        public DynamicFilterBuilder<T> NotEqualIfNotNull<TField>(Expression<Func<T, TField>> field, IEnumerable<TField> values) => NotEqualIf(field, values, values != null);
        public DynamicFilterBuilder<T> NotContainsIfNotNull(Expression<Func<T, object>> field, string value) => NotContainsIf(field, value, value != null);
        public DynamicFilterBuilder<T> NotContainsAllIfNotNull(Expression<Func<T, object>> field, IEnumerable<string> values) => NotContainsAllIf(field, values, values != null);
        public DynamicFilterBuilder<T> ArrayIncludesAllIfNotNull<TItem>(Expression<Func<T, IEnumerable<TItem>>> field, IEnumerable<TItem> values) => ArrayIncludesAllIf(field, values, values != null);
        public DynamicFilterBuilder<T> GreaterThanIfNotNull<TField>(Expression<Func<T, TField>> field, TField value) => GreaterThanIf(field, value, value != null);
        public DynamicFilterBuilder<T> LessThanIfNotNull<TField>(Expression<Func<T, TField>> field, TField value) => LessThanIf(field, value, value != null);
        public DynamicFilterBuilder<T> GreaterOrEqualThanIfNotNull<TField>(Expression<Func<T, TField>> field, TField value) => GreaterOrEqualThanIf(field, value, value != null);
        public DynamicFilterBuilder<T> LessOrEqualThanIfNotNull<TField>(Expression<Func<T, TField>> field, TField value) => LessOrEqualThanIf(field, value, value != null);

        #endregion


        public FilterDefinition<T> Build(bool allMandatory = true)
        {
            if(_filterDefinition.Count == 0)
            {
                return Builders<T>.Filter.Empty;
            }
            else if(_filterDefinition.Count == 1)
            {
                return _filterDefinition.First();
            }
            else if(allMandatory)
            {
                return Builders<T>.Filter.And(_filterDefinition);
            }
            else
            {
                return Builders<T>.Filter.Or(_filterDefinition);
            }
        }
    }
}
