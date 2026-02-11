# ============================================
# Split4Us Mobile - Development & Build Container
# ============================================
# Multi-stage build for Expo/React Native
# Supports: linting, testing, web build, EAS

FROM node:20-alpine AS base

# Install system dependencies needed for Expo
RUN apk add --no-cache git python3 make g++ bash

WORKDIR /app

# Copy package files first (Docker cache optimization)
COPY package.json package-lock.json* yarn.lock* ./

# Install dependencies
RUN npm install --legacy-peer-deps 2>/dev/null || npm install

# ============================================
# Development Stage
# ============================================
FROM base AS development

COPY . .

# Expose Expo dev server ports
EXPOSE 8081 19000 19001 19002

# Default: start Expo dev server (web)
CMD ["npx", "expo", "start", "--web", "--host", "0.0.0.0"]

# ============================================
# Test Stage
# ============================================
FROM base AS test

COPY . .

# Run TypeScript check and tests
CMD ["sh", "-c", "npx tsc --noEmit && npx jest --ci --coverage"]

# ============================================
# Web Build Stage
# ============================================
FROM base AS web-builder

COPY . .

# Build for web
RUN npx expo export --platform web

# ============================================
# Production Web Stage (nginx)
# ============================================
FROM nginx:alpine AS production

# Copy built web app
COPY --from=web-builder /app/dist /usr/share/nginx/html

# Custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
