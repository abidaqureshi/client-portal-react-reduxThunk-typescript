using System;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Serilog;
using Serilog.Core;
using Serilog.Events;
using Serilog.Formatting.Compact;
using WhichPharmaPortal.Config;

namespace WhichPharmaPortal
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var host = Host.CreateDefaultBuilder().Build();
            var config = host.Services.GetRequiredService<IConfiguration>().Get<Configuration>().Logging;

            Log.Logger = new LoggerConfiguration()
               .Enrich.FromLogContext()
               .Enrich.WithMachineName()
               .Enrich.WithThreadId()
               .Enrich.WithProperty("ApplicationName", nameof(WhichPharmaPortal))
               .MinimumLevel.Debug()
               .WriteTo.Console()
               .WriteTo.Seq(config.SeqHostName,
                    apiKey: config.SeqApiKey,
                    controlLevelSwitch: new LoggingLevelSwitch(LogEventLevel.Information))
               .WriteTo.File(
                    restrictedToMinimumLevel: LogEventLevel.Verbose,
                    formatter: new RenderedCompactJsonFormatter(),
                    path: config.FilePath,
                    rollingInterval: RollingInterval.Hour,
                    retainedFileCountLimit: config.MaxNumberOfFiles)
               .CreateLogger();

            try
            {
                Log.Information("Starting up");
                CreateHostBuilder(args).Build().Run();
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "Application error");
            }
            finally
            {
                Log.Information("Stopping");
                Log.CloseAndFlush();
            }
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .UseSerilog()
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}
