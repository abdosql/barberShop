#!/bin/sh
set -e

JWT_DIR=/var/www/html/config/jwt

# Create JWT directory
mkdir -p $JWT_DIR

# Generate the SSL keys if they don't exist
if [ ! -f $JWT_DIR/private.pem ]; then
    openssl genpkey -out $JWT_DIR/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096 -pass pass:${JWT_PASSPHRASE}
    openssl pkey -in $JWT_DIR/private.pem -out $JWT_DIR/public.pem -pubout -passin pass:${JWT_PASSPHRASE}
    
    # Set proper permissions
    chown www-data:www-data $JWT_DIR/private.pem $JWT_DIR/public.pem
    chmod 600 $JWT_DIR/private.pem
    chmod 644 $JWT_DIR/public.pem
fi