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
    openssl

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath

# Install Symfony CLI
RUN curl -1sLf 'https://dl.cloudsmith.io/public/symfony/stable/setup.deb.sh' | bash
RUN apt-get install symfony-cli

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy existing application directory
COPY . .

RUN composer install

COPY generate-jwt-keys.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/generate-jwt-keys.sh

EXPOSE 8000

CMD ["/bin/sh", "-c", "generate-jwt-keys.sh && symfony server:start --no-tls --port=8000 --allow-http --allow-all-ip"]