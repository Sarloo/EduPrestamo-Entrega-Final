# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS production-dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:22-alpine AS quality
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY eslint.config.js ./
COPY scripts ./scripts
COPY src ./src
COPY tests ./tests
RUN npm run lint && npm run test:coverage -- --ci

FROM node:22-alpine AS runtime
ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_PATH=/app/data/eduprestamo.sqlite

WORKDIR /app

COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node src ./src

RUN mkdir -p /app/data && chown node:node /app/data

USER node
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || '3000') + '/health').then((response) => { if (!response.ok) process.exit(1); }).catch(() => process.exit(1));"]

CMD ["npm", "start"]
