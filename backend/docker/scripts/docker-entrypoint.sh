#!/bin/sh
set -e

# Generate JWT keys if they don't exist
/usr/local/bin/generate-jwt-keys.sh

# First arg is `-f` or `--some-option`
if [ "${1#-}" != "$1" ]; then
    set -- php-fpm "$@"
fi

exec "$@" 