using WhichPharma.Database.Config;

namespace WhichPharmaPortal.Config.Database
{
    /// <summary>
    /// Default database config
    /// </summary>
    /// <seealso cref="IStorageConfig" />
    public class SpecificDatabaseConfig<Item> : IStorageConfig<Item>
    {
        /// <summary>Gets or sets the connection string.</summary>
        /// <value>The connection string.</value>
        public string ConnectionString { get; set; }

        /// <summary>Gets or sets the name of the database.</summary>
        /// <value>The name of the database.</value>
        public string DatabaseName { get; set; }
    }
}
