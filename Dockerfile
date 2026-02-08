# Build stage
FROM node:18-alpine

WORKDIR /app

COPY my-tldraw-yjs/package.json ./

# Install dependencies (including production ones)
RUN npm install

COPY my-tldraw-yjs/ .

# Build the client for production
RUN npm run build

# Expose port for y-websocket server
EXPOSE 1234

# We will run both the client preview/server and the websocket server.
# For simplicity in this starter, we can use a script to launch both or just run the server if it serves the static files.
# In this specific setup, we'll run the websocket server. To serve the client files, we might need a static file server.
# Let's use `serve` or similar.

RUN npm install -g serve concurrently

# Serve the client on port 3000 and run the websocket server on port 1234
CMD ["concurrently", "\"serve -s dist -l 3000\"", "\"node server.js\""]
