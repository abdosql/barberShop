FROM caddy:2-builder-alpine AS builder

# Build Caddy with Mercure module
RUN xcaddy build \
    --with github.com/caddyserver/caddy/v2@v2.9.1 \
    --with github.com/dunglas/mercure/caddy \
    --with github.com/dunglas/vulcain/caddy

FROM caddy:2-alpine

COPY --from=builder /usr/bin/caddy /usr/bin/caddy
