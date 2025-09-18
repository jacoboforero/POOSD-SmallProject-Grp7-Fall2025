# Match PHP 8.4 with Apache (mod_php)
ARG PHP_VERSION
FROM php:${PHP_VERSION}-apache

# Silence "Could not reliably determine FQDN"
RUN printf "ServerName localhost\n" > /etc/apache2/conf-available/servername.conf \
 && a2enconf servername

# Enable the Apache modules you have enabled on droplet
RUN a2enmod rewrite deflate

# Set DocumentRoot to /public like your vhost
ARG APACHE_DOCUMENT_ROOT
ENV APACHE_DOCUMENT_ROOT=${APACHE_DOCUMENT_ROOT}
RUN sed -ri -e "s!/var/www/html!${APACHE_DOCUMENT_ROOT}!g" \
  /etc/apache2/sites-available/000-default.conf \
  /etc/apache2/apache2.conf \
  /etc/apache2/conf-available/docker-php.conf || true

# OS libs needed by PHP extensions (gd/gettext/exif/etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
      libpng-dev libjpeg-dev libfreetype6-dev \
      libicu-dev libzip-dev \
      libonig-dev libxml2-dev \
      gettext-base \
      pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Configure and install PHP extensions to match your list
# (built-ins like tokenizer/json are already there)
RUN docker-php-ext-configure gd --with-freetype --with-jpeg || true \
 && docker-php-ext-install -j$(nproc) \
      mysqli pdo pdo_mysql gd gettext exif sockets shmop sysvmsg sysvsem sysvshm

# Sodium is bundled; enable explicitly if not auto-enabled
RUN docker-php-ext-enable sodium || true

# OPcache (Zend OPcache) is bundled; ensure enabled
RUN docker-php-ext-enable opcache

# APCu via PECL (you have apcu)
RUN pecl install apcu \
 && docker-php-ext-enable apcu

# Dev PHP settings
COPY php.ini /usr/local/etc/php/conf.d/php-dev.ini
