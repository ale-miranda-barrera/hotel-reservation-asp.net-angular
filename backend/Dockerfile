# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiar archivos .csproj
COPY ["HotelReservationAPI.Presentation/HotelReservationAPI.Presentation.csproj", "HotelReservationAPI.Presentation/"]
COPY ["HotelReservationAPI.Application/HotelReservationAPI.Application.csproj", "HotelReservationAPI.Application/"]
COPY ["HotelReservationAPI.Infrastructure/HotelReservationAPI.Infrastructure.csproj", "HotelReservationAPI.Infrastructure/"]
COPY ["HotelReservationAPI.Domain/HotelReservationAPI.Domain.csproj", "HotelReservationAPI.Domain/"]

# Restaurar dependencias
RUN dotnet restore "HotelReservationAPI.Presentation/HotelReservationAPI.Presentation.csproj"

# Copiar TODO el c�digo
COPY . .

# Publicar en Release
RUN dotnet publish "HotelReservationAPI.Presentation/HotelReservationAPI.Presentation.csproj" -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

# Copiar desde stage anterior
COPY --from=build /app/publish .

# Puerto
EXPOSE 8080

# Comando para ejecutar
ENTRYPOINT ["dotnet", "HotelReservationAPI.Presentation.dll"]