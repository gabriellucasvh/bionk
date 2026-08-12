# =============================================================
# Dockerfile — Bionk Next.js (standalone output)
# Build: docker build -t bionk .
# =============================================================

# ---- Etapa 1: Dependências de produção ----------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
# Instala TODAS as deps incluindo devDependencies (precisamos do prisma generate e do build)
RUN npm ci

# ---- Etapa 2: Build -----------------------------------------
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Gera o Prisma client antes do build
RUN npx prisma generate

# Build da aplicação Next.js (usa output: 'standalone' do next.config.js)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Etapa 3: Imagem de produção (mínima) -------------------
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Usuário não-root por segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia o output standalone (Next.js empacota server + deps mínimas)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma migrations — copiamos a pasta para rodar migrate deploy na inicialização
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma

# Script de entrypoint que roda migrate deploy antes de iniciar o servidor
COPY --chown=nextjs:nodejs scripts/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Entrypoint: migrate deploy + start
ENTRYPOINT ["./entrypoint.sh"]
