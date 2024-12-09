.PHONY: dev prod down build

# Development environment (PowerShell)
dev-win:
	@echo "Starting development environment in Windows..."
	@powershell -NoProfile -Command " \
		Set-Item -Path Env:VITE_API_URL -Value 'http://localhost:8000'; \
		Set-Item -Path Env:VITE_MERCURE_PUBLIC_URL -Value 'http://localhost:9999/.well-known/mercure'; \
		Set-Item -Path Env:FRONTEND_TARGET -Value 'development'; \
		Set-Item -Path Env:FRONTEND_PORT -Value '5173'; \
		Set-Item -Path Env:CORS_ALLOW_ORIGIN -Value 'http://localhost:5173 http://localhost:4173 http://localhost:8000'; \
		Set-Item -Path Env:MERCURE_PUBLIC_URL -Value 'http://localhost:9999/.well-known/mercure'; \
		docker compose up --build -d"

# Development environment (Linux)
dev:
	@echo "Starting development environment in Linux..."
	VITE_API_URL=http://localhost:8000 \
	VITE_MERCURE_PUBLIC_URL=http://localhost:9999/.well-known/mercure \
	FRONTEND_TARGET=development \
	FRONTEND_PORT=5173 \
	CORS_ALLOW_ORIGIN='http://localhost:5173 http://localhost:4173 http://localhost:8000' \
	MERCURE_PUBLIC_URL=http://localhost:9999/.well-known/mercure \
	docker compose up --build -d

# Production environment (Linux)
prod:
	@echo "Starting production environment..."
	VITE_API_URL=http://54.37.66.72:8000 \
	VITE_MERCURE_PUBLIC_URL=http://54.37.66.72:9999/.well-known/mercure \
	FRONTEND_TARGET=production \
	FRONTEND_PORT=4173 \
	CORS_ALLOW_ORIGIN='http://54.37.66.72:4173 http://54.37.66.72:8000' \
	MERCURE_PUBLIC_URL=http://54.37.66.72:9999/.well-known/mercure \
	docker compose up --build -d

# Production environment (PowerShell)
prod-win:
	@echo "Starting production environment in Windows..."
	@powershell -NoProfile -Command " \
		Set-Item -Path Env:VITE_API_URL -Value 'http://54.37.66.72:8000'; \
		Set-Item -Path Env:VITE_MERCURE_PUBLIC_URL -Value 'http://54.37.66.72:9999/.well-known/mercure'; \
		Set-Item -Path Env:FRONTEND_TARGET -Value 'production'; \
		Set-Item -Path Env:FRONTEND_PORT -Value '4173'; \
		Set-Item -Path Env:CORS_ALLOW_ORIGIN -Value 'http://54.37.66.72:4173 http://54.37.66.72:8000'; \
		Set-Item -Path Env:MERCURE_PUBLIC_URL -Value 'http://54.37.66.72:9999/.well-known/mercure'; \
		docker compose up --build -d"

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
# Stop all containers
down:
	@echo "Stopping all containers..."
	docker compose down

# Build containers without starting
build:
	@echo "Building containers..."
	docker compose build

# Show help
help:
	@echo "Available commands:"
	@echo "  make dev      - Start development environment in Linux (localhost:5173)"
	@echo "  make dev-win  - Start development environment in Windows (localhost:5173)"
	@echo "  make prod     - Start production environment in Linux (54.37.66.72:4173)"
	@echo "  make prod-win - Start production environment in Windows (54.37.66.72:4173)"
	@echo "  make down     - Stop all containers"
	@echo "  make build    - Build containers without starting"
