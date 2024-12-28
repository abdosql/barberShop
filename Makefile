.PHONY: dev prod down build setup-db enter-backend enter-frontend help

# Development environment
dev:
	@echo "Starting development environment..."
	APP_ENV=development \
	FRONTEND_TARGET=development \
	docker compose --env-file ./frontend/.env.development \
	               --env-file ./backend/.env.development \
	               --env-file ./notification/.env \
	               up --build -d

# Production environment
prod:
	@echo "Starting production environment..."
	APP_ENV=production \
	FRONTEND_TARGET=production \
	docker compose --env-file ./frontend/.env.production \
	               --env-file ./backend/.env.production \
	               --env-file ./notification/.env \
	               up --build -d
	
# Stop all containers
down:
	@echo "Stopping all containers..."
	docker compose down

# Build containers
build:
	@echo "Building containers..."
	docker compose build

setup-db:
	@echo "Setting up database..."
	@docker compose exec backend php bin/console d:d:d --force
	@docker compose exec backend php bin/console d:d:c
	@docker compose exec backend php bin/console d:m:m
	@docker compose exec backend php bin/console d:f:l

enter-backend:
	@docker compose exec backend bash

enter-frontend:
	@docker compose exec frontend sh

# Show help
help:
	@echo "Available commands:"
	@echo "  make dev      - Start development environment (frontend: localhost:80, backend: localhost/api)"
	@echo "  make prod     - Start production environment (frontend: 54.37.66.72, backend: 54.37.66.72/api)"
	@echo "  make down     - Stop all containers"
	@echo "  make build    - Build containers without starting"