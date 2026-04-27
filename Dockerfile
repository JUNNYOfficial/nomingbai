# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci && npm ci --prefix frontend

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy backend dependencies and source
COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/
COPY Kimi-Agent/ ./Kimi-Agent/
COPY public/ ./public/
COPY --from=builder /app/frontend/dist/ ./frontend/dist/

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/status', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "src/server.js"]
