# syntax=docker/dockerfile:1
# Build context is the repo root (monorepo workspaces): docker build -f backend/services/admin-service/Dockerfile .

FROM node:22-alpine AS builder
WORKDIR /repo
COPY package.json package-lock.json* ./
COPY backend/services/admin-service ./backend/services/admin-service
COPY backend/shared ./backend/shared
RUN npm ci
RUN npm run build --workspace=backend/shared/auth-middleware --workspace=backend/shared/security-middleware --workspace=backend/shared/types --workspace=@mini-tube/admin-service

FROM node:22-alpine AS runtime
WORKDIR /repo
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
COPY backend/services/admin-service/package.json ./backend/services/admin-service/package.json
COPY backend/shared/auth-middleware/package.json ./backend/shared/auth-middleware/package.json
COPY backend/shared/security-middleware/package.json ./backend/shared/security-middleware/package.json
COPY backend/shared/types/package.json ./backend/shared/types/package.json
RUN npm ci --omit=dev
COPY --from=builder /repo/backend/services/admin-service/dist ./backend/services/admin-service/dist
COPY --from=builder /repo/backend/shared/auth-middleware/dist ./backend/shared/auth-middleware/dist
COPY --from=builder /repo/backend/shared/security-middleware/dist ./backend/shared/security-middleware/dist
COPY --from=builder /repo/backend/shared/types/dist ./backend/shared/types/dist

EXPOSE 5016
CMD ["node", "backend/services/admin-service/dist/server.js"]
