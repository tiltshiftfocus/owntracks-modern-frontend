# Build stage
FROM oven/bun:1-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN bun install --frozen-lockfile || bun install

# Copy source files
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM nginx:alpine

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Copy custom nginx configuration as template
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
