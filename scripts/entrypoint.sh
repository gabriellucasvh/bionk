#!/bin/sh
# scripts/entrypoint.sh
# Aguarda o PostgreSQL ficar pronto, roda migrate deploy e inicia o servidor Next.js

set -e

echo "==> Aguardando PostgreSQL..."
until pg_isready -h postgres -p 5432 -U "$POSTGRES_USER" 2>/dev/null; do
  echo "   PostgreSQL não está pronto ainda — aguardando 2s..."
  sleep 2
done
echo "==> PostgreSQL pronto!"

export NODE_PATH=$(npm root -g)
echo "==> Rodando prisma migrate deploy..."
npx prisma migrate deploy

echo "==> Iniciando servidor Next.js..."
exec node server.js
