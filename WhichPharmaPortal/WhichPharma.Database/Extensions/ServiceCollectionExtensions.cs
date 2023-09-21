using Microsoft.Extensions.DependencyInjection;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;
using System;
using System.Linq;
using System.Reflection;
using WhichPharma.Database.Config;
using WhichPharma.Database.Services;
using WhichPharma.Database.Services.Implementations;
using WhichPharma.Models.Database;

namespace WhichPharma.Database.Extensions
{
    public static class ServiceCollectionExtensions
    {
        private static void RegisterAllEnumsInNamespaceWithStringSerializer(params string[] namespaces)
        {
            var enums = from t in Assembly.GetExecutingAssembly().GetTypes()
                        where t.IsEnum && namespaces.Contains(t.Namespace)
                        select t;

            var registerSerializerMethod = typeof(BsonSerializer)
                .GetMethods()
                .First(m => m.Name == nameof(BsonSerializer.RegisterSerializer) && m.GetParameters().Length == 1);

            foreach (var _enum in enums)
            {
                var serializerType = typeof(EnumSerializer<>).MakeGenericType(_enum);
                var constructor = serializerType.GetConstructor(new Type[] { typeof(BsonType) });
                var serializer = constructor.Invoke(new object[] { BsonType.String });

                registerSerializerMethod
                    .MakeGenericMethod(_enum)
                    .Invoke(null, new object[] { serializer });
            }
        }

        public static void AddWhichPharmaDatabase(this IServiceCollection serviceCollection, IStorageConfig defaultConfig)
        {
            DatabaseHelper.ConfigureMongoDBDefaults();

            serviceCollection.AddSingleton(defaultConfig);
            serviceCollection.AddSingleton(typeof(IStorageConfig<>), typeof(StorageConfigFactory<>));

            serviceCollection.AddScoped<ILegacyProductsStorage, LegacyProductsStorage>();
            serviceCollection.AddScoped<IProductsStorage, ProductsStorage>();
            serviceCollection.AddScoped<IUsersStorage, UsersStorage>();
            serviceCollection.AddScoped<IShortagesStorage, ShortagesStorage>();
            serviceCollection.AddScoped<ISuppliersStorage, SuppliersStorage>();
            serviceCollection.AddScoped<IPlatformStorage, PlatformStorage>();
            serviceCollection.AddScoped<IRFQsStorage, RFQsStorage>();
            serviceCollection.AddScoped<IProductDocumentStorage, ProductDocumentStorage>();
            serviceCollection.AddScoped<IScrapperStorage, ScrapperStorage>();
        }
    }
}
