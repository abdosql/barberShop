#!/bin/sh
set -e

# Generate JWT keys if they don't exist
if [ ! -f config/jwt/private.pem ]; then
    php bin/console lexik:jwt:generate-keypair --skip-if-exists
    
    # Set proper permissions
    setfacl -R -m u:www-data:rX -m u:"$(whoami)":rwX config/jwt
    setfacl -dR -m u:www-data:rX -m u:"$(whoami)":rwX config/jwt
fi

# First arg is `-f` or `--some-option`
if [ "${1#-}" != "$1" ]; then
    set -- php-fpm "$@"
fi

exec "$@" 