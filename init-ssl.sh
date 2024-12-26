#!/bin/bash

# Create directories for certbot
mkdir -p ./certbot/conf
mkdir -p ./certbot/www

# Stop any running containers
docker-compose down

# Get SSL certificate
docker run -it --rm \
  -v "$PWD/certbot/conf:/etc/letsencrypt" \
  -v "$PWD/certbot/www:/var/www/certbot" \
  certbot/certbot certonly \
  --standalone \
  --preferred-challenges http \
  --email admin@jalalbarber.com \
  --agree-tos \
  --non-interactive \
  -d jalalbarber.com \
  -d www.jalalbarber.com

# Check if certificates were obtained successfully
if [ $? -eq 0 ]; then
    echo "SSL certificates obtained successfully"
    # Start containers
    docker-compose up -d
else
    echo "Failed to obtain SSL certificates. Please check the logs above for errors."
    exit 1
fi
