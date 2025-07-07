# Multi-stage Dockerfile for React frontend

# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with NGINX
FROM nginx:alpine as production

# Create nginx user and group
RUN addgroup -g 1000 -S nginx_app && \
    adduser -u 1000 -D -S -G nginx_app nginx_app

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/dist/spa /usr/share/nginx/html

# Copy SSL certificates if needed (for production)
# COPY ssl/ /etc/nginx/ssl/

# Set ownership
RUN chown -R nginx_app:nginx_app /usr/share/nginx/html /etc/nginx /var/cache/nginx /var/run

# Create log directories
RUN mkdir -p /var/log/nginx && \
    chown -R nginx_app:nginx_app /var/log/nginx

# Switch to non-root user
USER nginx_app

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3004/health || exit 1

# Expose port
EXPOSE 3004

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
