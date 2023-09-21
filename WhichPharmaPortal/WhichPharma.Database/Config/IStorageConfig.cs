namespace WhichPharma.Database.Config
{
    public interface IStorageConfig
    {
        string ConnectionString { get; set; }
        string DatabaseName { get; set; }
    }

    public interface IStorageConfig<Item> : IStorageConfig
    {
    }
}
