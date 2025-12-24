# Multi-stage build for Vite React app served by Nginx

# 1) Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Pass API base at build-time (default to "/api")
ARG VITE_API_BASE=/api
ENV VITE_API_BASE=${VITE_API_BASE}

# Copy sources and build
COPY . .
RUN npm run build

# 2) Runtime stage with Nginx
FROM nginx:1.27-alpine AS runner

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx site config (serves app and proxies /api -> backend service)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
