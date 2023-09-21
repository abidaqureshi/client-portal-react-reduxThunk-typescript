using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using WhichPharma.Database.Config;
using WhichPharma.Database.Services.Implementations;
using WhichPharma.Queue;
using WhichPharma.Queue.Implementations.RabbitMQ;
using WhichPharma.Services.Email;
using WhichPharma.Services.GoogleServices;
using WhichPharma.Services.Identity;
using WhichPharma.Services.Platform;
using WhichPharma.Services.Products;
using WhichPharma.Services.RFQs;
using WhichPharma.Services.Scrappers;
using WhichPharma.Services.Shortages;
using WhichPharma.Services.Suppliers;
using WhichPharma.StandardTerms;
using WhichPharma.StreakIntegration;
using WhichPharmaPortal.Config;
using WhichPharmaPortal.Config.Database;

namespace WhichPharmaPortal.Extensions
{
    /// <summary>
    /// WhichPharma ServiceCollection extensions
    /// </summary>
    public static class ServiceCollectionExtensions
    {
        /// <summary>
        /// Register Dependency Injection for all services from WhichPharma API
        /// </summary>
        /// <param name="serviceCollection"></param>
        /// <param name="config"></param>
        public static void AddWhichPharmaServices(this IServiceCollection serviceCollection, Configuration config)
        {
            serviceCollection.AddSingleton<IRFQServiceConfiguration>(config.RFQService);
            serviceCollection.AddSingleton<IGoogleServiceConfig>(config.GoogleService);
            serviceCollection.AddSingleton<IStreakIntegrationClientConfig>(config.StreakIntegration);
            serviceCollection.AddSingleton<IEmailServiceConfig>(config.EmailService);

            serviceCollection.AddScoped<ILegacyProductSets, LegacyProductsSets>();
            serviceCollection.AddScoped<ILegacyProductsService, LegacyProductsService>();
            serviceCollection.AddScoped<IProductSets, ProductsSets>();
            serviceCollection.AddScoped<IProductsService, ProductsService>();
            serviceCollection.AddScoped<IShortagesService, ShortagesService>();
            serviceCollection.AddScoped<ISuppliersService, SuppliersService>();
            serviceCollection.AddScoped<IEmailService, EmailService>();
            serviceCollection.AddScoped<IRFQService, RFQService>();
            serviceCollection.AddScoped<IPlatformService, PlatformService>();
            serviceCollection.AddScoped<IGoogleService, GoogleService>();
            serviceCollection.AddHttpClient<IStandardTermsClient, StandardTermsClient>();
            serviceCollection.AddScoped<IProductDocumentService, ProductDocumentService>();
            serviceCollection.AddScoped<IScrapperService, ScrapperService>();

            serviceCollection.AddSingleton(config.QueueClient);
            serviceCollection.AddScoped<IQueueClient, RabbitMQClient>();
            serviceCollection.AddScoped<IStreakIntegrationClient, StreakIntegrationClient>();
        }

        /// <summary>
        /// Register Identity Service and add required authorization services/middlewares to ASP.NET service collection
        /// </summary>
        public static void AddWhichPharmaAuthorizationServices(
            this IServiceCollection serviceCollection,
            IIdentityServiceConfiguration identityServiceConfig)
        {
            serviceCollection.AddSingleton(identityServiceConfig);
            serviceCollection.AddScoped<IIdentityService, IdentityService>();

            serviceCollection
                .AddAuthentication(x =>
                {
                    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(x =>
                {
                    x.RequireHttpsMetadata = true;
                    x.SaveToken = true;
                    x.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(identityServiceConfig.Secret)),
                        ValidateIssuer = false,
                        ValidateAudience = false,
                    };
                });
        }

        /// <summary>
        /// Adds the specific databases configuration, by other words, adds all specific configs not null in <paramref name="config"/>.
        /// </summary>
        /// <param name="services">The services.</param>
        /// <param name="config">The database configuration.</param>
        public static void AddSpecificDatabasesConfig(this IServiceCollection services, DatabaseConfig config)
        {
            if (config.Products != null) services.AddSingleton<IStorageConfig<ProductsStorage>>(config.Products);
            if (config.LegacyProducts != null) services.AddSingleton<IStorageConfig<LegacyProductsStorage>>(config.LegacyProducts);
            if (config.RFQs != null) services.AddSingleton<IStorageConfig<RFQsStorage>>(config.RFQs);
            if (config.Shortages != null) services.AddSingleton<IStorageConfig<ShortagesStorage>>(config.Shortages);
            if (config.Users != null) services.AddSingleton<IStorageConfig<UsersStorage>>(config.Users);
            if (config.Suppliers != null) services.AddSingleton<IStorageConfig<SuppliersStorage>>(config.Suppliers);
        }
    }
}
