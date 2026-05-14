# InventOS Backend

Multi-tenant inventory management API built with Laravel.

## Prerequisites

- Docker & Docker Compose
- Make (optional, for convenience commands)

## Quick Start with Docker

```bash
# 1. Clone and enter the project
cd inventoryOs

# 2. Copy environment file
cp backend/.env.example backend/.env

# 3. Generate app key
docker compose -f docker/docker-compose.yml run --rm app php artisan key:generate

# 4. Start all services
docker compose -f docker/docker-compose.yml up -d

# 5. Run migrations and seeders
docker compose -f docker/docker-compose.yml exec app php artisan migrate --seed

# 6. The API is now available at
http://localhost:8000/api
```

## Services

| Service    | Container       | Port |
|------------|----------------|------|
| API        | inventos-app   | 9000 |
| Nginx      | inventos-nginx | 8000 |
| PostgreSQL | inventos-db    | 5432 |
| Redis      | inventos-redis | 6379 |

## Common Commands

```bash
# Start containers
docker compose -f docker/docker-compose.yml up -d

# Stop containers
docker compose -f docker/docker-compose.yml down

# View logs
docker compose -f docker/docker-compose.yml logs -f app

# Run artisan commands
docker compose -f docker/docker-compose.yml exec app php artisan <command>

# Run migrations
docker compose -f docker/docker-compose.yml exec app php artisan migrate

# Run tests
docker compose -f docker/docker-compose.yml exec app php artisan test

# Install composer dependencies
docker compose -f docker/docker-compose.yml run --rm app composer install

# Rebuild container after dependency changes
docker compose -f docker/docker-compose.yml build app
```

## Local Development (without Docker)

```bash
cd backend

# Install dependencies
composer install

# Copy environment and configure your database
cp .env.example .env
# Edit .env: set DB_CONNECTION=pgsql or DB_CONNECTION=sqlite

# Generate key and run migrations
php artisan key:generate
php artisan migrate --seed

# Start dev server
php artisan serve
```

## Environment Variables

Key environment variables in `.env`:

| Variable          | Default            | Description      |
|-------------------|--------------------|------------------|
| `DB_CONNECTION`   | `pgsql`            | Database driver  |
| `DB_HOST`         | `127.0.0.1`        | Database host    |
| `DB_PORT`         | `5432`             | Database port    |
| `DB_DATABASE`     | `inventos`         | Database name    |
| `DB_USERNAME`     | `inventos`         | Database user    |
| `DB_PASSWORD`     | `inventos_secret`  | Database password|
| `REDIS_HOST`      | `127.0.0.1`        | Redis host       |
| `REDIS_PORT`      | `6379`             | Redis port       |

## API Endpoints

### Authentication

| Method | Endpoint              | Auth Required | Description        |
|--------|-----------------------|---------------|--------------------|
| POST   | `/api/auth/register`  | No            | Register new user  |
| POST   | `/api/auth/login`     | No            | Login              |
| POST   | `/api/auth/logout`    | Yes           | Logout             |
| GET    | `/api/auth/me`        | Yes           | Get current user   |
| PUT    | `/api/auth/profile`   | Yes           | Update profile     |
| POST   | `/api/auth/send-otp`  | Yes           | Send OTP code      |
| POST   | `/api/auth/verify-otp`| Yes           | Verify OTP code    |
| POST   | `/api/auth/forgot-password` | No       | Request password reset|
| POST   | `/api/auth/reset-password` | No       | Reset password     |

## Project Structure

```
app/
  Modules/
    Auth/         # Authentication module
    Inventory/    # (Phase 1)
    Accounting/   # (Phase 3)
    Invoices/     # (Phase 2)
    Sales/        # (Phase 2)
    Suppliers/    # (Phase 1)
    Reports/      # (Phase 6)
    AI/           # (Phase 7)
  Services/       # Shared services
  Repositories/   # Data access layer
  DTO/            # Data transfer objects
  Traits/         # Reusable traits
  Jobs/           # Queue jobs
  Events/         # Event classes
  Listeners/      # Event listeners
```
