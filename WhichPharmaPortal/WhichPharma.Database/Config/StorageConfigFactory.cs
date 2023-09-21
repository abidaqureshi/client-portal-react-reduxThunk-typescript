using System;

namespace WhichPharma.Database.Config
{
    public class StorageConfigFactory<Item> : IStorageConfig<Item>
    {
        public StorageConfigFactory(IStorageConfig @default)
        {
            ConnectionString = @default.ConnectionString;
            DatabaseName = @default.DatabaseName;
        }

        public string ConnectionString { get; set; }
        public string DatabaseName { get; set; }
    }
}
