# Stage 1: Build React app + compile server
FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build
RUN npx tsc -p server/tsconfig.json

# Stage 2: Runtime with nginx + node
FROM node:22-alpine

RUN apk add --no-cache nginx

# Copy nginx config
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy built React app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy compiled server + production deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY --from=build /app/dist-server ./dist-server

# Start script: run nginx + node server
CMD nginx && node dist-server/proxy.js
