FROM node:18-alpine

WORKDIR /excalidraw-room

COPY package.json yarn.lock ./
RUN yarn --network-timeout 600000

COPY tsconfig.json ./
COPY src ./src
RUN yarn build

EXPOSE 80
CMD ["yarn", "start"]
