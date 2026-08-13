#!/bin/bash
# scripts/deploy.sh
# Blue-Green Deployment sem downtime para a VPS

set -e

# Garante que o arquivo de upstream exista
if [ ! -f "nginx/upstream.conf" ]; then
    echo "server 127.0.0.1:3001;" > nginx/upstream.conf
fi

# Lê qual porta está atualmente configurada no NGINX
CURRENT_UPSTREAM=$(cat nginx/upstream.conf)

if [[ "$CURRENT_UPSTREAM" == *"3001"* ]]; then
    ACTIVE_COLOR="blue"
    TARGET_COLOR="green"
    TARGET_PORT="3002"
    TARGET_CONTAINER="bionk_app_green"
    ACTIVE_CONTAINER="bionk_app_blue"
else
    ACTIVE_COLOR="green"
    TARGET_COLOR="blue"
    TARGET_PORT="3001"
    TARGET_CONTAINER="bionk_app_blue"
    ACTIVE_CONTAINER="bionk_app_green"
fi

BRANCH=${1:-master}

echo "================================================="
echo "🟢 Ambiente Ativo: $ACTIVE_COLOR"
echo "🚀 Iniciando deploy para: $TARGET_COLOR (Porta $TARGET_PORT) da branch: $BRANCH"
echo "================================================="

echo "📦 Puxando últimas alterações do Git da branch $BRANCH..."
git fetch origin
git checkout $BRANCH
git reset --hard origin/$BRANCH

echo "🔧 Garantindo que Postgres e Redis estão rodando..."
docker compose --env-file .env.production up -d postgres redis

echo "🏗️  Construindo e iniciando o container $TARGET_CONTAINER..."
docker compose --env-file .env.production --profile $TARGET_COLOR up -d --build app-$TARGET_COLOR

echo "⏳ Aguardando $TARGET_CONTAINER ficar saudável..."
MAX_RETRIES=40
RETRY_COUNT=0
HEALTHY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    # Testa a API de healthcheck silenciosamente
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:$TARGET_PORT/api/health || true)
    
    if [ "$HTTP_STATUS" == "200" ]; then
        HEALTHY=true
        break
    fi
    
    echo "   ...aguardando (tentativa $((RETRY_COUNT+1))/$MAX_RETRIES)"
    sleep 3
    RETRY_COUNT=$((RETRY_COUNT+1))
done

if [ "$HEALTHY" = "false" ]; then
    echo "❌ ERRO: O novo container ($TARGET_CONTAINER) não ficou saudável a tempo!"
    echo "Desligando container defeituoso para não gastar memória..."
    docker compose --env-file .env.production --profile $TARGET_COLOR stop app-$TARGET_COLOR
    echo "⚠️ O deploy foi abortado, mas o Bionk CONTINUA NO AR no container antigo!"
    exit 1
fi

echo "✅ Novo container está saudável e pronto para receber tráfego!"

echo "🔄 Trocando NGINX silenciosamente para $TARGET_COLOR (Porta $TARGET_PORT)..."
echo "server 127.0.0.1:$TARGET_PORT;" > nginx/upstream.conf
sudo systemctl reload nginx

echo "🛑 Desligando o container antigo ($ACTIVE_CONTAINER)..."
docker compose --env-file .env.production --profile $ACTIVE_COLOR stop app-$ACTIVE_COLOR

echo "================================================="
echo "🎉 Deploy Blue-Green concluído com sucesso e ZERO DOWNTIME!"
echo "================================================="
