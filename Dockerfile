# Build frontend
FROM node:20-slim AS frontend-builder

WORKDIR /app/frontend

# Copy frontend files
COPY frontend/package*.json ./
COPY frontend/tsconfig*.json ./

# Install dependencies including dev dependencies
RUN npm install
RUN npm install --save-dev @types/node

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# Build backend
FROM node:20-slim AS backend-builder

WORKDIR /app

# Copy backend files
COPY package*.json ./
COPY tsconfig.json ./

# Install backend dependencies
RUN npm install

# Copy backend source and schema
COPY src/ ./src/

# Ensure db directory exists in source
RUN mkdir -p src/db

# Build backend
RUN npm run build

# Copy schema to dist folder
RUN mkdir -p dist/db && cp src/db/schema.sql dist/db/

# Production stage
FROM node:20-slim

WORKDIR /app

# Install nginx
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Copy backend files
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/node_modules ./node_modules
COPY package*.json ./

# Copy frontend files
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Create database directory
RUN mkdir -p /app/db

# Copy start script
COPY start.sh ./
RUN chmod +x start.sh

# Expose ports
EXPOSE 5173 8175

CMD ["./start.sh"] 