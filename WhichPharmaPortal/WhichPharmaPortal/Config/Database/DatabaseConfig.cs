using WhichPharma.Database.Services.Implementations;

namespace WhichPharmaPortal.Config.Database
{
    /// <summary>
    /// Databases config
    /// </summary>
    public class DatabaseConfig
    {
        /// <summary>
        /// Gets or sets the default database configuration.
        /// </summary>
        /// <value>
        /// The default.
        /// </value>
        public DefaultDatabaseConfig Default { get; set; }
        /// <summary>
        /// Gets or sets the products database configuration.
        /// <para>Default configuration is used if null.</para>
        /// </summary>
        /// <value>
        /// The products database configuration.
        /// </value>
        public SpecificDatabaseConfig<ProductsStorage> Products { get; set; }
        /// <summary>
        /// Gets or sets the legacy products database configuration.
        /// <para>Default configuration is used if null.</para>
        /// </summary>
        /// <value>
        /// The legacy products database configuration.
        /// </value>
        public SpecificDatabaseConfig<LegacyProductsStorage> LegacyProducts { get; set; }
        /// <summary>
        /// Gets or sets the shortages database configuration.
        /// <para>Default configuration is used if null.</para>
        /// </summary>
        /// <value>
        /// The shortages database configuration.
        /// </value>
        public SpecificDatabaseConfig<ShortagesStorage> Shortages { get; set; }
        /// <summary>
        /// Gets or sets the RFQs database configuration.
        /// <para>Default configuration is used if null.</para>
        /// </summary>
        /// <value>
        /// The RFQs database configuration.
        /// </value>
        public SpecificDatabaseConfig<RFQsStorage> RFQs { get; set; }
        /// <summary>
        /// Gets or sets the suppliers database configuration.
        /// <para>Default configuration is used if null.</para>
        /// </summary>
        /// <value>
        /// The suppliers database configuration.
        /// </value>
        public SpecificDatabaseConfig<SuppliersStorage> Suppliers { get; set; }
        /// <summary>
        /// Gets or sets the users database configuration.
        /// <para>Default configuration is used if null.</para>
        /// </summary>
        /// <value>
        /// The users database configuration.
        /// </value>
        public SpecificDatabaseConfig<UsersStorage> Users { get; set; }
    }
}
