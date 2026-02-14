# Build stage
FROM node:18-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY app/package.json app/package-lock.json* ./

# Install all dependencies (including dev for build)
RUN npm install

# Copy source code
COPY app/ .

# Build client
RUN npm run build

# Production stage
FROM node:18-alpine

# better-sqlite3 needs native build tools
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install production dependencies + global tools
COPY app/package.json app/package-lock.json* ./
RUN npm install --omit=dev && npm install -g serve concurrently tsx

# Copy built client
COPY --from=builder /app/dist ./dist

# Copy server source (tsx will run TypeScript directly)
COPY app/src/server ./src/server

# Create data directories
RUN mkdir -p /app/data/rooms /app/data/assets

# Expose ports: 3000 for frontend, 5858 for sync server
EXPOSE 3000 5858

# Run both: sync server + static file server
CMD ["sh", "-c", "concurrently \"tsx src/server/server.ts\" \"serve -s dist -l 3000\""]
