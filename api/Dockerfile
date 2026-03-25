# --- BUILD STAGE ---
FROM node:20-slim AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml tsconfig.json ./
RUN pnpm install --frozen-lockfile
COPY src ./src
RUN pnpm run build

# --- RUNTIME STAGE ---
FROM node:20-slim

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 flexbit-backend

WORKDIR /app
COPY --from=builder --chown=flexbit-backend:nodejs /app/dist ./dist
COPY --from=builder --chown=flexbit-backend:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=flexbit-backend:nodejs /app/package.json ./package.json

USER flexbit-backend

EXPOSE 5000
CMD ["node", "dist/server.js"]
