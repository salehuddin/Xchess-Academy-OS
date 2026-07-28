#!/bin/sh
set -e

mkdir -p /app/storage/framework/cache/data
mkdir -p /app/storage/framework/sessions
mkdir -p /app/storage/framework/views
mkdir -p /app/storage/app/public
mkdir -p /app/storage/logs
mkdir -p /app/bootstrap/cache

chown -R www-data:www-data /app/storage /app/bootstrap/cache

if [ -f /app/vendor/autoload.php ]; then
    echo "Discovering packages..."
    php artisan package:discover --ansi || true

    echo "Running migrations..."
    php artisan migrate --force || true

    echo "Linking storage..."
    php artisan storage:link || true

    echo "Seeding database..."
    php artisan db:seed --force || true

    echo "Caching config, routes, views..."
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

exec "$@"
