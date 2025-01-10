FROM php:8.2-cli-alpine

# Install supervisor and PostgreSQL dev dependencies
RUN apk add --no-cache supervisor postgresql-dev

# Install PHP PDO PostgreSQL extension
RUN docker-php-ext-install pdo pdo_pgsql

# Set working directory
WORKDIR /var/www/html

# Create directory for supervisor logs
RUN mkdir -p /var/log/supervisor

# Copy supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy the cron scripts
COPY daily-cron.sh /usr/local/bin/daily-cron.sh
COPY weekly-cron.sh /usr/local/bin/weekly-cron.sh
RUN chmod +x /usr/local/bin/daily-cron.sh /usr/local/bin/weekly-cron.sh

# Start supervisor
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"] 