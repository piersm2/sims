# Build stage
FROM node:20-slim AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy built files to Nginx serve directory
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose frontend port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 