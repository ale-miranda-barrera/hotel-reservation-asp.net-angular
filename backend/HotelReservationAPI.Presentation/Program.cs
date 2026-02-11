using Microsoft.EntityFrameworkCore;
using HotelReservationAPI.Infrastructure.Data;
using HotelReservationAPI.Domain.Interfaces;
using HotelReservationAPI.Infrastructure.Repositories;
using HotelReservationAPI.Application.Services;

var builder = WebApplication.CreateBuilder(args);

// Agregar DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Agregar repositorios
builder.Services.AddScoped<IHotelRepository, HotelRepository>();
builder.Services.AddScoped<IReservationRepository, ReservationRepository>();

// Agregar servicios
builder.Services.AddScoped<IHotelService, HotelService>();

// Agregar controladores
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Ejecutar migraciones
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngular");
app.UseHttpsRedirection();
app.MapControllers();

app.Run();