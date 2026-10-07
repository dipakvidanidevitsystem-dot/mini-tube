# syntax=docker/dockerfile:1
# Build context is the repo root (monorepo workspaces): docker build -f server/Dockerfile .

FROM node:22-alpine AS builder
WORKDIR /repo
COPY package.json package-lock.json* ./
COPY server ./server
COPY shared ./shared
RUN npm ci
RUN npm run build --workspace=shared/security-middleware --workspace=minitube-server

FROM node:22-alpine AS runtime
WORKDIR /repo
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
COPY server/package.json ./server/package.json
COPY shared/security-middleware/package.json ./shared/security-middleware/package.json
RUN npm ci --omit=dev
COPY --from=builder /repo/server/dist ./server/dist
COPY --from=builder /repo/shared/security-middleware/dist ./shared/security-middleware/dist

EXPOSE 5001
CMD ["node", "server/dist/server.js"]
