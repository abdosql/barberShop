#!/bin/bash

# Create directories for certbot
mkdir -p ./certbot/conf
mkdir -p ./certbot/www

# Run certbot
docker run -it --rm \
  -v "$PWD/certbot/conf:/etc/letsencrypt" \
  -v "$PWD/certbot/www:/var/www/certbot" \
  certbot/certbot certonly \
  --webroot --webroot-path /var/www/certbot \
  -d jalalbarber.com -d www.jalalbarber.com \
  --email jalalbelbachir20@gmail.com --agree-tos --no-eff-email
