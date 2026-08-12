#!/bin/bash
# scripts/deploy.sh
# Executa na VPS: git pull + rebuild + restart sem downtime

set -e

COMPOSE_CMD="docker compose --env-file .env.production"

echo "==> Puxando últimas alterações do Git..."
git pull origin feat/vps

echo "==> Rebuild do container da aplicação..."
$COMPOSE_CMD build app

echo "==> Reiniciando containers..."
$COMPOSE_CMD up -d

echo "==> Status dos containers:"
$COMPOSE_CMD ps

echo "==> Deploy concluído!"
