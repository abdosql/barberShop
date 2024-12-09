FROM caddy:2-alpine

# Install required tools
RUN apk add --no-cache \
    git \
    go

# Set Go environment variables
ENV PATH="/root/go/bin:${PATH}"
ENV GOPATH=/root/go
ENV CGO_ENABLED=0

# Install xcaddy
RUN go install github.com/caddyserver/xcaddy/cmd/xcaddy@latest

# Build Caddy with Mercure
RUN xcaddy build \
    --with github.com/dunglas/mercure
