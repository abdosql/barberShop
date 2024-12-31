# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# For production, copy the correct env file before building
RUN if [ "$FRONTEND_TARGET" = "production" ]; then \
    cp .env.production .env; \
    fi

# Build for production if needed
RUN npm run build

# Development stage
FROM node:18-alpine as development
WORKDIR /app
COPY package*.json ./
RUN npm install
# Don't copy source code in development as it will be mounted
ENV NODE_ENV=development
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Production stage
FROM node:18-alpine as production
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist .
EXPOSE 4173
CMD ["serve", "-s", ".", "-l", "4173", "--cors"]