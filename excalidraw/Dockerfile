FROM --platform=${BUILDPLATFORM} node:20 AS build

WORKDIR /opt/node_app

COPY . .

# do not ignore optional dependencies:
# Error: Cannot find module @rollup/rollup-linux-x64-gnu
RUN --mount=type=cache,target=/root/.cache/yarn \
    npm_config_target_arch=${TARGETARCH} yarn --network-timeout 600000

ARG NODE_ENV=production

# Collaboration server URL - baked into frontend at build time
ARG VITE_APP_WS_SERVER_URL=https://tablica-ws.nexocloud.pl
ENV VITE_APP_WS_SERVER_URL=${VITE_APP_WS_SERVER_URL}

# Disable tracking and unnecessary services
ENV VITE_APP_ENABLE_TRACKING=false
ENV VITE_APP_FIREBASE_CONFIG={}

RUN npm_config_target_arch=${TARGETARCH} yarn build:app:docker

FROM --platform=${TARGETPLATFORM} nginx:1.27-alpine

COPY --from=build /opt/node_app/excalidraw-app/build /usr/share/nginx/html

HEALTHCHECK CMD wget -q -O /dev/null http://localhost || exit 1
