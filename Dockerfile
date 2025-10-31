FROM node:18-alpine AS builder

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./


RUN npm ci --only=production && npm cache clean --force


COPY src ./src

RUN npm run build


FROM node:18-alpine

RUN apk add --no-cache \
    cairo \
    jpeg \
    pango \
    giflib

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./


RUN mkdir -p /app/models

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "dist/server.js"]