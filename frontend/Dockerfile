# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and env files
COPY . .

# Create dist directory and copy appropriate env file based on target
RUN mkdir -p dist && \
    if [ "$FRONTEND_TARGET" = "production" ]; then \
        cp .env.production .env && \
        npm run build; \
    else \
        cp .env.development .env; \
    fi

# Development stage
FROM node:18-alpine as development
WORKDIR /app
COPY package*.json ./
RUN npm install
# Don't copy source code in development as it will be mounted
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Production stage
FROM nginx:alpine as production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 4173
WORKDIR /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]