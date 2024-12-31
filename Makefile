.PHONY: dev prod down build setup-db enter-backend enter-frontend help clean

# Development environment (Windows)
dev:
	@echo "Starting development environment..."
	ENV_MODE=development \
	APP_ENV=dev \
	FRONTEND_TARGET=development \
	CADDY_CONFIG_PATH=./caddy/Caddyfile.development \
	docker compose --env-file ./frontend/.env.development \
	               --env-file ./backend/.env.development \
	               --env-file ./notification/.env \
	               up --build -d
	@echo "Waiting for containers to be ready..."
	@timeout 10
	@make setup-db

# Production environment (Ubuntu)
prod:
	@echo "Starting production environment..."
	ENV_MODE=production \
	APP_ENV=prod \
	FRONTEND_TARGET=production \
	CADDY_CONFIG_PATH=./caddy/Caddyfile.production \
	docker compose --env-file ./frontend/.env.production \
	               --env-file ./backend/.env.production \
	               --env-file ./notification/.env \
	               up --build -d
	@echo "Waiting for containers to be ready..."
	@sleep 10s
	@make setup-db

# Stop all containers
down:
	@echo "🔽 Stopping and cleaning up..."
	@docker compose down -v --remove-orphans
	@echo "🧹 Cleaning frontend build artifacts..."
	@if [ -d "frontend/dist" ]; then rm -rf frontend/dist; fi
	@if [ -d "frontend/node_modules" ]; then rm -rf frontend/node_modules; fi
	@echo "✨ Cleanup complete"

# PowerShell version of down command
down-win:
	@echo "🔽 Stopping and cleaning up..."
	@docker compose down -v --remove-orphans
	@echo "🧹 Cleaning frontend build artifacts..."
	@powershell -Command "if (Test-Path 'frontend/dist') { Remove-Item -Recurse -Force 'frontend/dist' }"
	@powershell -Command "if (Test-Path 'frontend/node_modules') { Remove-Item -Recurse -Force 'frontend/node_modules' }"
	@echo "✨ Cleanup complete"
	
# Build containers
build:
	@echo "Building containers..."
	docker compose build

setup-db:
	@echo "Setting up database..."
	@docker compose exec backend php bin/console d:d:d --force
	@docker compose exec backend php bin/console d:d:c
	@docker compose exec backend php bin/console d:m:m
	@echo "Loading fixtures in dev environment..."
	@docker compose exec -e APP_ENV=dev backend php bin/console d:f:l
	@echo "Resetting environment back to production..."
	@docker compose exec -e APP_ENV=prod backend php bin/console cache:clear

enter-backend:
	@docker compose exec backend bash

enter-frontend:
	@docker compose exec frontend sh

# Deep clean everything
clean:
	@echo "🧹 Performing deep clean of all Docker resources..."
	@docker compose down --volumes --remove-orphans
	@docker system prune --all --force --volumes
	@echo "✨ Clean complete - all Docker resources have been removed"


# Show help
help:
	@echo "Available commands:"
	@echo "  make dev      - Start development environment (frontend: localhost:80, backend: localhost/api)"
	@echo "  make prod     - Start production environment (frontend: 54.37.66.72, backend: 54.37.66.72/api)"
	@echo "  make down     - Stop all containers and clean up (Linux/Mac)"
	@echo "  make down-win - Stop all containers and clean up (Windows PowerShell)"
	@echo "  make build    - Build containers without starting"
	@echo "  make clean    - Remove all Docker containers, images, volumes, and cached data"
	@echo "  make shop-status       - Get current shop status"
	@echo "  make shop-status-update - Update shop status (set to open)"