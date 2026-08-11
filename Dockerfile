# NanoAnalyzer - Production Cloud Deployment Container
# Base Image: Official PHP 8.2 with Apache Web Server
FROM php:8.2-apache

# Install system dependencies and required PHP extensions for PostgreSQL (pdo_pgsql, curl, mbstring)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    libcurl4-openssl-dev \
    libonig-dev \
    && docker-php-ext-install pdo pdo_pgsql curl mbstring \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache mod_rewrite for clean URL routing
RUN a2enmod rewrite

# Configure PHP to populate $_ENV and getenv from Docker container environment (Render)
RUN echo "variables_order = \"EGPCS\"" > /usr/local/etc/php/conf.d/env.ini

# Configure Apache to pass through Render environment variables to worker processes
RUN echo "PassEnv DATABASE_URL SUPABASE_DB_URL SUPABASE_URL SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY SUPABASE_DB_HOST SUPABASE_DB_PORT SUPABASE_DB_NAME SUPABASE_DB_USER SUPABASE_DB_PASSWORD DB_HOST DB_PORT DB_NAME DB_USER DB_PASSWORD POSTGRES_URL POSTGRES_HOST POSTGRES_PORT POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD APP_ENV SECRET_KEY" >> /etc/apache2/apache2.conf

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
