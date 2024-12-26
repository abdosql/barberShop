#!/bin/bash

# Create directories for certbot
mkdir -p ./certbot/conf
mkdir -p ./certbot/www

# Stop any running containers
docker-compose down

# Get SSL certificate
docker run -it --rm \
  -v "./certbot/conf:/etc/letsencrypt" \
  -v "./certbot/www:/var/www/certbot" \
  certbot/certbot certonly \
  --standalone \
  --preferred-challenges http \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d jalalbarber.com \
  -d www.jalalbarber.com

# Start containers
docker-compose up -d
