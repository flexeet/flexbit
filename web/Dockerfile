# --- BUILD STAGE ---
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=${NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# --- RUNTIME STAGE ---
FROM node:20-alpine AS runner

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 flexbit-frontend

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder --chown=flexbit-frontend:nodejs /app/.next/standalone ./
COPY --from=builder --chown=flexbit-frontend:nodejs /app/.next/static ./.next/static

USER flexbit-frontend

EXPOSE 3000
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

CMD ["node", "server.js"]
