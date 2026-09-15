# Этап 1: Базовый образ для запуска (ASP.NET Core Runtime)
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
ARG GIT_COMMIT=unknown
ARG APP_VERSION=1.0.0

ENV GIT_COMMIT=${GIT_COMMIT}
ENV APP_VERSION=${APP_VERSION}

WORKDIR /app
EXPOSE 8080
EXPOSE 8081
ENV ASPNETCORE_HTTP_PORTS=8080

# Этап 2: Образ для сборки (SDK)
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Копируем файлы проектов для восстановления зависимостей (кэширование слоя)
COPY ["src/AssetTracker.WebAPI/AssetTracker.WebAPI.csproj", "src/AssetTracker.WebAPI/"]
COPY ["src/AssetTracker.Application/AssetTracker.Application.csproj", "src/AssetTracker.Application/"]
COPY ["src/AssetTracker.Domain/AssetTracker.Domain.csproj", "src/AssetTracker.Domain/"]
COPY ["src/AssetTracker.Infrastructure/AssetTracker.Infrastructure.csproj", "src/AssetTracker.Infrastructure/"]

# Восстанавливаем пакеты
RUN dotnet restore "./src/AssetTracker.WebAPI/AssetTracker.WebAPI.csproj"

# Копируем весь исходный код
COPY . .

# Переходим в папку API проекта и собираем
WORKDIR "/src/src/AssetTracker.WebAPI"
RUN dotnet build "./AssetTracker.WebAPI.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Этап 3: Публикация
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./AssetTracker.WebAPI.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Этап 4: Финальный образ
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "AssetTracker.WebAPI.dll"]