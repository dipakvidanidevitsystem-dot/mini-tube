# syntax=docker/dockerfile:1
# Build context is the repo root (monorepo workspaces): docker build -f backend/services/user-service/Dockerfile .

FROM node:22-alpine AS builder
WORKDIR /repo
COPY package.json package-lock.json* ./
COPY backend/services/user-service ./backend/services/user-service
COPY backend/shared ./backend/shared
RUN npm ci
RUN npm run build --workspace=backend/shared/auth-middleware --workspace=backend/shared/security-middleware --workspace=backend/shared/types --workspace=@mini-tube/user-service

FROM node:22-alpine AS runtime
WORKDIR /repo
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
COPY backend/services/user-service/package.json ./backend/services/user-service/package.json
COPY backend/shared/auth-middleware/package.json ./backend/shared/auth-middleware/package.json
COPY backend/shared/security-middleware/package.json ./backend/shared/security-middleware/package.json
COPY backend/shared/types/package.json ./backend/shared/types/package.json
RUN npm ci --omit=dev
COPY --from=builder /repo/backend/services/user-service/dist ./backend/services/user-service/dist
COPY --from=builder /repo/backend/shared/auth-middleware/dist ./backend/shared/auth-middleware/dist
COPY --from=builder /repo/backend/shared/security-middleware/dist ./backend/shared/security-middleware/dist
COPY --from=builder /repo/backend/shared/types/dist ./backend/shared/types/dist

EXPOSE 5012
CMD ["node", "backend/services/user-service/dist/server.js"]
