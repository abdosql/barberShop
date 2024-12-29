.PHONY: dev prod prod-ssl down build setup-db enter-backend enter-frontend help

# Development environment
dev:
	@echo "Starting development environment..."
	APP_ENV=development \
	FRONTEND_TARGET=development \
	FRONTEND_ENV_FILE=./frontend/.env.development \
	BACKEND_ENV_FILE=./backend/.env.development \
	docker compose --env-file ./frontend/.env.development \
	               --env-file ./backend/.env.development \
	               --env-file ./notification/.env \
	               up --build -d

# Production environment
prod:
	@echo "Starting production environment..."
	APP_ENV=production \
	FRONTEND_TARGET=production \
	FRONTEND_ENV_FILE=./frontend/.env.production \
	BACKEND_ENV_FILE=./backend/.env.production \
	docker compose --env-file ./frontend/.env.production \
	               --env-file ./backend/.env.production \
	               --env-file ./notification/.env \
	               up --build -d

# Production environment with SSL
prod-ssl:
	@echo "Starting production environment with SSL..."
	APP_ENV=production \
	FRONTEND_TARGET=production \
	APP_SECRET=80e75e1ceea2218d7be4a9d66df9d5b9752a069f337bbdcd97187991132d1ff3 \
	APP_DEBUG=0 \
	CORS_ALLOW_ORIGIN="https://jalalbarber.com https://mercure.jalalbarber.com" \
	TRUSTED_HOSTS=^jalalbarber\.com$$ \
	JWT_PASSPHRASE=80e75e1ceea2218d7be4a9d66df9d5b9752a069f337bbdcd97187991132d1ff3 \
	MERCURE_PUBLIC_URL=https://mercure.jalalbarber.com/.well-known/mercure \
	VITE_API_URL=https://jalalbarber.com \
	VITE_MERCURE_PUBLIC_URL=https://mercure.jalalbarber.com/.well-known/mercure \
	VITE_MERCURE_HOST=mercure.jalalbarber.com \
	APP_URL=https://jalalbarber.com \
	CADDY_FILE=Caddyfile.production.ssl \
	docker compose up --build -d

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
	@echo "  make prod-ssl - Start production environment with SSL (domain: jalalbarber.com)"
	@echo "  make down     - Stop all containers"
	@echo "  make build    - Build containers without starting"