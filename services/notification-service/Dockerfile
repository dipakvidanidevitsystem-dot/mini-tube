# syntax=docker/dockerfile:1
# Build context is the repo root (monorepo workspaces): docker build -f services/notification-service/Dockerfile .

FROM node:22-alpine AS builder
WORKDIR /repo
COPY package.json package-lock.json* ./
COPY services/notification-service ./services/notification-service
COPY shared ./shared
RUN npm ci
RUN npm run build --workspace=shared/auth-middleware --workspace=shared/types --workspace=@mini-tube/notification-service

FROM node:22-alpine AS runtime
WORKDIR /repo
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
COPY services/notification-service/package.json ./services/notification-service/package.json
COPY shared/auth-middleware/package.json ./shared/auth-middleware/package.json
COPY shared/types/package.json ./shared/types/package.json
RUN npm ci --omit=dev
COPY --from=builder /repo/services/notification-service/dist ./services/notification-service/dist
COPY --from=builder /repo/shared/auth-middleware/dist ./shared/auth-middleware/dist
COPY --from=builder /repo/shared/types/dist ./shared/types/dist

EXPOSE 5017
CMD ["node", "services/notification-service/dist/server.js"]
