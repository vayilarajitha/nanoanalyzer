# NanoAnalyzer - Production Cloud Deployment Container
# Base Image: Official PHP 8.2 with Apache Web Server
FROM php:8.2-apache

# Install system dependencies and required PHP extensions for Supabase (pdo_pgsql, curl, mbstring)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    libcurl4-openssl-dev \
    libonig-dev \
    && docker-php-ext-install pdo pdo_pgsql curl mbstring \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache mod_rewrite for clean URL routing
RUN a2enmod rewrite

# Set container working directory to Apache document root
WORKDIR /var/www/html

# Copy application source code into the web root
COPY . /var/www/html/

# Create uploads directory and set www-data ownership
RUN mkdir -p /var/www/html/uploads \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Expose standard web HTTP port
EXPOSE 80
