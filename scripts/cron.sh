#!/bin/bash
# scripts/cron.sh
# Dispara o rollup de analytics via API interna
# Adicionar ao crontab: 0 2 * * * /root/bionk/scripts/cron.sh >> /var/log/bionk-cron.log 2>&1

set -e

NEXTAUTH_URL="${NEXTAUTH_URL:-https://bionk.duckdns.org}"
CRON_SECRET="${CRON_SECRET:-}"

if [ -z "$CRON_SECRET" ]; then
  # Tenta carregar do .env.production se existir
  if [ -f /root/bionk/.env.production ]; then
    export $(grep -v '^#' /root/bionk/.env.production | grep CRON_SECRET | xargs)
  fi
fi

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Disparando rollup cron..."

curl -s -o /dev/null -w "%{http_code}" \
  -X POST "${NEXTAUTH_URL}/api/cron/rollups" \
  -H "X-Cron-Secret: ${CRON_SECRET}" \
  -H "Content-Type: application/json"

echo ""
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Cron concluído."
