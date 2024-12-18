FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev \
    openssl \
    --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /tmp/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy docker configuration files
COPY docker/scripts/generate-jwt-keys.sh /usr/local/bin/
COPY docker/scripts/docker-entrypoint.sh /usr/local/bin/

# Fix line endings and make scripts executable
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
    && sed -i 's/\r$//' /usr/local/bin/generate-jwt-keys.sh \
    && chmod +x /usr/local/bin/generate-jwt-keys.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

# Copy application files
COPY . .

RUN composer install

# Create jwt directory and set initial permissions
RUN mkdir -p config/jwt && \
    chown -R root:root config/jwt && \
    chmod 777 config/jwt

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["php-fpm"]