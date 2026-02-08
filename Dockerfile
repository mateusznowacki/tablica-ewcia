# Build stage
FROM node:20-alpine

WORKDIR /app

COPY my-tldraw-multiplayer/package.json my-tldraw-multiplayer/package-lock.json ./

RUN npm install

COPY my-tldraw-multiplayer/ .

# Expose port for wrangler dev
EXPOSE 8787

# Use npx wrangler dev to run the Cloudflare worker locally
CMD ["npx", "wrangler", "dev", "--host", "0.0.0.0", "--port", "8787"]
