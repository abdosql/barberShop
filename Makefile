.PHONY: dev prod down build

# Development environment (PowerShell)
dev-win:
	@echo "Starting development environment in Windows..."
	powershell -Command "$$env:VITE_API_URL='http://localhost:8000'; \
	$$env:FRONTEND_TARGET='development'; \
	$$env:FRONTEND_PORT='5173'; \
	$$env:CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1|54\.37\.66\.72)(:[0-9]+)?$$'; \
	docker compose up --build"

# Development environment (Linux)
dev:
	@echo "Starting development environment in Linux..."
	VITE_API_URL=http://localhost:8000 \
	FRONTEND_TARGET=development \
	FRONTEND_PORT=5173 \
	CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1|54\.37\.66\.72)(:[0-9]+)?$$' \
	docker compose up --build

# Production environment (Linux)
prod:
	@echo "Starting production environment..."
	VITE_API_URL=http://54.37.66.72:8000 \
	FRONTEND_TARGET=production \
	FRONTEND_PORT=4173 \
	CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1|54\.37\.66\.72)(:[0-9]+)?$$' \
	docker compose up --build

# Production environment (PowerShell)
prod-win:
	@echo "Starting production environment in Windows..."
	powershell -Command "$$env:VITE_API_URL='http://54.37.66.72:8000'; \
	$$env:FRONTEND_TARGET='production'; \
	$$env:FRONTEND_PORT='4173'; \
	$$env:CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1|54\.37\.66\.72)(:[0-9]+)?$$'; \
	docker compose up --build"

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