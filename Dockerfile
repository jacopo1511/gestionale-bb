# syntax=docker/dockerfile:1

# ─── deps: installa tutte le dipendenze ───────────────────────
FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
# serve prima di "npm ci" perche' lo script postinstall lancia "prisma generate"
COPY prisma ./prisma
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public" npm ci

# ─── builder: genera Prisma Client e builda Next (standalone) ─
FROM node:22-bookworm-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Valori fittizi usati SOLO in fase di build (a runtime li passa "docker run -e ...").
ARG BUILD_DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
ARG BUILD_APP_SECRET="build-time-placeholder-not-used-at-runtime-0000000000"
RUN DATABASE_URL="$BUILD_DATABASE_URL" APP_SECRET="$BUILD_APP_SECRET" npx prisma generate
RUN DATABASE_URL="$BUILD_DATABASE_URL" APP_SECRET="$BUILD_APP_SECRET" APP_BASE_URL="http://localhost:3000" npm run build

# ─── runner: immagine finale minimale ───────────────────────
FROM node:22-bookworm-slim AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Output standalone di Next.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# node_modules completo: la CLI Prisma (per "migrate deploy" all'avvio) ha
# molte dipendenze hoistate che la copia selezionata non prendeva.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/scripts ./scripts
COPY docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh && mkdir -p /data/documenti

# Gira come root: su Unraid semplifica i permessi sui bind mount delle share appdata.
EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "server.js"]
