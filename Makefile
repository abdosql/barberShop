.PHONY: dev prod down build

# Development environment
dev:
	@echo "Starting development environment..."
	set APP_ENV=development && docker compose up --build -d

# Production environment
prod:
	@echo "Starting production environment..."
	APP_ENV=production \
	FRONTEND_TARGET=production \
	docker compose --env-file ./frontend/.env.production \
	               --env-file ./backend/.env.production \
	               --env-file ./notificagtion/.env \
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
	@echo "  make dev      - Start development environment (localhost:5173)"
	@echo "  make prod     - Start production environment (54.37.66.72:4173)"
	@echo "  make down     - Stop all containers"
	@echo "  make build    - Build containers without starting"
