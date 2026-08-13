# Arquitetura e Infraestrutura - Bionk

Este documento descreve a infraestrutura de produção da aplicação Bionk. Originalmente concebida para operar em um ecossistema serverless, a aplicação foi migrada para uma arquitetura baseada em containers (Docker) hospedada de forma independente em uma Virtual Private Server (VPS).

## 1. O Que Mudou (Migração Serverless -> VPS)

Para reduzir custos recorrentes, assumir controle total sobre a infraestrutura e evitar o cold start de serviços serverless, a stack do Bionk passou pelas seguintes transformações:

| Componente | Antes (Serverless) | Agora (VPS Própria) | Benefício da Mudança |
| :--- | :--- | :--- | :--- |
| **Hospedagem / Frontend** | Vercel | Container Docker (Next.js Standalone) | Sem limites de banda ou tempo de execução (Vercel Timeout). |
| **Banco de Dados** | Neon (Serverless Postgres) | PostgreSQL 15 (Container Docker) | Sem limites de conexões simultâneas, dados persistidos localmente. |
| **Cache / Sessões** | Upstash (Serverless Redis) | Redis (Container Docker) | Latência zero (Redis está na mesma rede do app), sem limite de requisições. |
| **Proxy e SSL** | Vercel Edge Network | NGINX + Certbot (Let's Encrypt) | Regras de proxy customizáveis, Rate Limiting avançado sob nosso controle. |
| **Domínio / DNS** | Vercel DNS | DuckDNS (`bionk.duckdns.org`) | Gratuito e aponta diretamente para o IP da VPS. |

---

## 2. Como Tudo Funciona Agora

A aplicação é orquestrada pelo **Docker Compose**. Todos os serviços rodam de forma interconectada dentro do servidor, mas completamente isolados do mundo externo.

### 2.1 A Trindade dos Containers (`docker-compose.yml`)

1. **`postgres` (Banco de Dados)**:
   - Roda a imagem oficial do PostgreSQL 15.
   - Os dados são salvos fisicamente na VPS dentro do volume Docker `pgdata`, garantindo que não sejam perdidos caso o container reinicie.
   - **Segurança:** A porta `5432` **não** é exposta para a internet. Só quem consegue conversar com o banco de dados é o aplicativo Bionk.

2. **`redis` (Cache)**:
   - Roda a imagem oficial do Redis com a engine Alpine (levíssima).
   - Usa o volume `redisdata` para gravar dados na VPS (AOF - Append Only File) para que as sessões e o cache sobrevivam a reinicializações.
   - **Segurança:** A porta `6379` **não** é exposta. Apenas o app conversa com ele.

3. **`app` (Next.js - Bionk)**:
   - A espinha dorsal do projeto. Uma imagem Docker customizada (através do `Dockerfile`) constrói o Bionk usando a funcionalidade `output: standalone` do Next.js.
   - Antes do app subir de fato, o script `scripts/entrypoint.sh` entra em ação. Ele "pinga" o banco de dados até ele acordar e, em seguida, dispara o `prisma migrate deploy`, garantindo que todas as tabelas (43 no total) existam antes do código rodar.

### 2.2 NGINX: O Porteiro de Segurança (`nginx/bionk.conf`)

A porta do servidor Node.js (3000 interna, mapeada para 3001) é intencionalmente configurada para ouvir *apenas* a rede interna (`127.0.0.1:3001`). Isso obriga todo e qualquer usuário a passar pelo **NGINX**.

O NGINX atua como um Proxy Reverso e Firewall realizando as seguintes funções:
- **SSL (Cadeado Verde):** Usa os certificados gerados pelo Certbot para criptografar todo o tráfego de ponta a ponta.
- **Redirecionamento:** Força quem entra via `http://` a ir para `https://`.
- **Proteção Anti-DDoS Básica:** O NGINX possui limites (`limit_req`) nas rotas principais e rotas de autenticação. Se alguém tentar fazer força bruta de login ou "flood" no site, o NGINX bloqueia o IP temporariamente antes mesmo de chegar no Node.js.
- **Buffers de Cabeçalho Turbinados:** Configurado para absorver o imenso payload de preloads (fontes, chunks) que a arquitetura App Router do Next.js 14/15 envia, evitando erros *502 Bad Gateway*.
- **Proteção de Headers HTTP:** Bloqueia XSS, impede que o site seja colocado em iFrames por terceiros (`X-Frame-Options`), e força HTTPS rigoroso (`Strict-Transport-Security`).

---

## 3. O Fluxo de Vida de um Deploy

Caso você faça alterações no código (por exemplo, na máquina local) e queira atualizar a produção:

1. **GitHub:** Você faz o push do código para a branch `feat/vps` (futuramente `main`).
2. **VPS:** Você entra na sua VPS via SSH e roda:
   ```bash
   git pull origin feat/vps
   docker compose --env-file .env.production up -d --build
   ```
3. **O Que Acontece por Baixo dos Panos:**
   - O Docker lê o seu `Dockerfile`, baixa o Node, instala as bibliotecas limpas e compila o Next.js do zero.
   - Ele cria a nova versão e desliga a antiga em questão de milissegundos.
   - O `entrypoint.sh` roda as migrações do Prisma (caso você tenha mudado algo no banco).
   - O NGINX continua rodando 100% do tempo; se houver downtime, será de poucos segundos enquanto o app inicializa.
   - Para limpar o lixo de imagens velhas e recuperar espaço na VPS, basta rodar `docker image prune -a`.

## 4. Onde Moram os Segredos (Variáveis de Ambiente)

A regra de ouro da aplicação: **Nenhum segredo (senhas, chaves da Stripe, Supabase, JWT) está versionado no GitHub.**
Todos eles vivem num arquivo chamado `.env.production` que fica solto fisicamente na pasta `/root/bionk/` da sua VPS. 
O Docker Compose lê esse arquivo no momento do boot e injeta as variáveis com segurança direto na memória do container Next.js.
