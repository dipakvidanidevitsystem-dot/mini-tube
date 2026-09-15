# syntax=docker/dockerfile:1
# Build context is the repo root (monorepo workspaces): docker build -f services/comment-service/Dockerfile .

FROM node:22-alpine AS builder
WORKDIR /repo
COPY package.json package-lock.json* ./
COPY services/comment-service ./services/comment-service
COPY shared ./shared
RUN npm ci
RUN npm run build --workspace=shared/auth-middleware --workspace=shared/types --workspace=@mini-tube/comment-service

FROM node:22-alpine AS runtime
WORKDIR /repo
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
COPY services/comment-service/package.json ./services/comment-service/package.json
COPY shared/auth-middleware/package.json ./shared/auth-middleware/package.json
COPY shared/types/package.json ./shared/types/package.json
RUN npm ci --omit=dev
COPY --from=builder /repo/services/comment-service/dist ./services/comment-service/dist
COPY --from=builder /repo/shared/auth-middleware/dist ./shared/auth-middleware/dist
COPY --from=builder /repo/shared/types/dist ./shared/types/dist

EXPOSE 5014
CMD ["node", "services/comment-service/dist/server.js"]
