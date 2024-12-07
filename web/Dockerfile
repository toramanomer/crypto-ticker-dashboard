FROM node:20-alpine as builder

WORKDIR /app

# Copy root workspace files
COPY package*.json ./
COPY tsconfig*.json ./
COPY .prettierrc ./

# Copy frontend-specific files
COPY web/package*.json ./web/
COPY web/tsconfig*.json ./web/
COPY web/index.html ./web/
COPY web/vite.config.ts ./web/

# Install dependencies
RUN npm install

# Copy source code
COPY web/src/ ./web/src/

# Build
WORKDIR /app/web
RUN npm run build

# Production image
FROM nginx:alpine
COPY --from=builder /app/web/dist /usr/share/nginx/html
COPY web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]