FROM php:8.4-fpm AS base

RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx supervisor \
    curl wget git unzip \
    libpng-dev libjpeg-dev libfreetype6-dev libwebp-dev \
    libzip-dev libonig-dev libxml2-dev libicu-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j2 \
        pdo_mysql bcmath gd zip intl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN printf '%s\n' \
    '[supervisord]' \
    'nodaemon=true' \
    'logfile=/dev/stdout' \
    'logfile_maxbytes=0' \
    'pidfile=/var/run/supervisord.pid' \
    '' \
    '[program:php-fpm]' \
    'command=php-fpm -F' \
    'stdout_logfile=/dev/stdout' \
    'stdout_logfile_maxbytes=0' \
    'stderr_logfile=/dev/stderr' \
    'stderr_logfile_maxbytes=0' \
    '' \
    '[program:queue-worker]' \
    'command=php /app/artisan queue:work --tries=3 --max-time=3600' \
    'autorestart=true' \
    'stdout_logfile=/dev/stdout' \
    'stdout_logfile_maxbytes=0' \
    'stderr_logfile=/dev/stderr' \
    'stderr_logfile_maxbytes=0' \
    '' \
    '[program:nginx]' \
    'command=nginx -g "daemon off;"' \
    'stdout_logfile=/dev/stdout' \
    'stdout_logfile_maxbytes=0' \
    'stderr_logfile=/dev/stderr' \
    'stderr_logfile_maxbytes=0' \
    > /etc/supervisor/conf.d/supervisord.conf

RUN printf '%s\n' \
    'server {' \
    '    listen 80 default_server;' \
    '    root /app/public;' \
    '    index index.php;' \
    '    client_max_body_size 100M;' \
    '' \
    '    location / {' \
    '        try_files $uri $uri/ /index.php?$query_string;' \
    '    }' \
    '' \
    '    location ~ \.php$ {' \
    '        fastcgi_pass 127.0.0.1:9000;' \
    '        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;' \
    '        include fastcgi_params;' \
    '        fastcgi_param HTTP_X_FORWARDED_FOR $http_x_forwarded_for;' \
    '        fastcgi_param HTTP_X_FORWARDED_HOST $http_x_forwarded_host;' \
    '        fastcgi_param HTTP_X_FORWARDED_PORT $http_x_forwarded_port;' \
    '        fastcgi_param HTTP_X_FORWARDED_PROTO $http_x_forwarded_proto;' \
    '        fastcgi_param HTTP_X_FORWARDED_SSL $http_x_forwarded_ssl;' \
    '    }' \
    '' \
    '    location ~ /\.(?!well-known).* {' \
    '        deny all;' \
    '    }' \
    '}' \
    > /etc/nginx/sites-available/default \
    && rm -f /etc/nginx/sites-enabled/default \
    && ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

COPY docker/php/php.ini /usr/local/etc/php/conf.d/zz-app.ini

COPY --from=node:22 /usr/local/bin/node /usr/local/bin/node
COPY --from=node:22 /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm && \
    ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-autoloader

COPY . .
RUN npm install --legacy-peer-deps && npm run build
RUN composer dump-autoload --optimize --no-dev --no-scripts

RUN mkdir -p /app/storage/framework/cache \
             /app/storage/framework/sessions \
             /app/storage/framework/views \
             /app/bootstrap/cache \
             /app/storage/app/public \
             /app/storage/logs \
    && mkdir -p /app/public \
    && ln -sf /app/storage/app/public /app/public/storage \
    && chown -R www-data:www-data /app/storage /app/bootstrap/cache

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
