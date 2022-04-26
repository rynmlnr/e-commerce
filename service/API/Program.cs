using API.Extensions;
using API.Helpers;
using API.Middleware;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
{
    var services = builder.Services;

    services.AddAutoMapper(typeof(MappingProfiles));

    services.AddControllers();
    services.AddDbContext<StoreContext>(x =>
        x.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
        
    services.AddSingleton<IConnectionMultiplexer, ConnectionMultiplexer>(c=> {
        var configuration = ConfigurationOptions.Parse(builder.Configuration.GetConnectionString("Redis"), true);
        return ConnectionMultiplexer.Connect(configuration);
    });

    services.AddApplicationServices();

    // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
    services.AddSwaggerDocumentation();
    services.AddCors(opt => 
    {
        opt.AddPolicy("CorsPolicy", policy =>
        {
            policy.AllowAnyHeader().AllowAnyMethod().WithOrigins("https://localhost:4200");
        });
    });
}

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var loggerFactory = services.GetRequiredService<ILoggerFactory>();
    try
    {
        var context = services.GetRequiredService<StoreContext>();
        await context.Database.MigrateAsync();
        await StoreContextSeed.SeedAsync(context, loggerFactory);
    }
    catch (Exception ex)
    {
        var logger = loggerFactory.CreateLogger<Program>();
        logger.LogError(ex, "An error occured during migration");
    }
}

// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwaggerDocumentation();
}

app.UseStatusCodePagesWithReExecute("/errors/{0}");

app.UseHttpsRedirection();

app.UseRouting();

app.UseStaticFiles();

app.UseCors("CorsPolicy");

app.UseAuthorization();

app.MapControllers();

app.Run();
