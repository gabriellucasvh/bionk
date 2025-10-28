# Bionk

Bionk é uma plataforma **Link in Bio** moderna e personalizável, desenvolvida com **Next.js 15**, **Tailwind CSS** e **Prisma**. O projeto permite que usuários criem e personalizem suas próprias páginas de links, facilitando o compartilhamento de conteúdo online. Inclui sistema de assinaturas com integração ao Mercado Pago.

## ✨ Tecnologias Utilizadas

- **Next.js 15** - Framework React para aplicações modernas.
- **React 19** - Biblioteca para interfaces de usuário.
- **Tailwind CSS (v4)** - Estilização moderna e responsiva.
- **Prisma (PostgreSQL)** - ORM para manipulação do banco de dados.
- **NeonDB** - Banco de dados escalável baseado em PostgreSQL na nuvem.
- **Redis - Upstash** - Armazenamento em cache, gerenciamento de sessões e rate limiter.
- **Cloudinary** - Armazenamento e otimização de imagens e vídeos na nuvem.
- **Docker** - Containerização para desenvolvimento e deploy consistentes.
- **NextAuth.js** - Autenticação segura e integrada.
- **Mercado Pago** - Integração para processamento de pagamentos.
- **Framer Motion** - Animações suaves e fluidas.
- **DND Kit** - Drag and Drop interativo.
- **Radix UI** - Componentes acessíveis e práticos.
- **Recharts** - Visualização de dados interativa.
- **Zod** - Validação de esquemas com TypeScript.
- **BiomeJS** - Ferramenta de formatação e linting de código moderna.


## 🛠️ Instalação e Uso

1. Clone o repositório:

   ```sh
   git clone https://github.com/seu-usuario/bionk.git
   ```

2. Acesse o diretório do projeto:

   ```sh
   cd bionk
   ```

3. Instale as dependências:

   ```sh
   npm install
   # ou
   yarn install
   ```

4. Configure as variáveis de ambiente (crie um arquivo `.env` baseado em `.env.example`).

5. Configure variáveis essenciais no arquivo `.env`:

  - Banco de Dados:
    - `DATABASE_URL=postgresql://user:password@host:5432/bionk`
  - NextAuth:
    - `NEXTAUTH_SECRET=...`
    - `GOOGLE_CLIENT_ID=...`
    - `GOOGLE_CLIENT_SECRET=...`
  - Cloudinary (uploads e importação de mídia):
    - `CLOUDINARY_CLOUD_NAME=...`
    - `CLOUDINARY_API_KEY=...`
    - `CLOUDINARY_API_SECRET=...`
  - Pagamentos (Stripe):
    - `STRIPE_SECRET_KEY=...`
    - `STRIPE_WEBHOOK_SECRET=...`
    - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...`
  - Emails (Resend):
    - `RESEND_API_KEY=...`
  - Biblioteca de Mídias (novo):
    - `PEXELS_API_KEY=...` (busca de imagens retrato)
    - `COVERR_API_KEY=...` (busca de vídeos verticais, header `Authorization: Bearer`)

6. Execute o projeto em modo de desenvolvimento:

   ```sh
   npm run dev
   ```

## 💳 Pagamentos

Estamos migrando para Stripe para simplificar a configuração. Consulte `STRIPE_SETUP.md` para os passos que você deve seguir na plataforma da Stripe após criar sua conta.
6. Acesse no navegador:

   ```
   http://localhost:3000
   ```

## 🔧 Comandos Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento.
- `npm run build` - Gera a versão otimizadora para produção.
- `npm run start` - Inicia a aplicação em modo de produção.
- `npm run lint` - Executa a análise de código com ESLint.

## 🌐 Deploy

O Bionk pode ser implantado facilmente em plataformas como **Vercel** ou **Railway**. Basta configurar as variáveis de ambiente e conectar ao banco de dados PostgreSQL.

### Biblioteca de Mídias (Pexels/Coverr)
- No Studio, ao escolher “Biblioteca”, você pode buscar:
  - Imagens do Pexels com orientação vertical (`portrait`).
  - Vídeos do Coverr filtrados por `is_vertical`.
- Ao importar, imagens são automaticamente recortadas para 9:16 e vídeos são ajustados para 1080×1920 via Cloudinary.
- É necessário configurar `PEXELS_API_KEY` e `COVERR_API_KEY` no `.env`.

## 📈 Analíticas, Rollups e Idempotência

Este projeto consolida eventos diários (views e cliques) em rollups mensais para reduzir custo de leitura e melhorar performance dos gráficos.

- Endpoint de cron: `GET /api/cron/rollups`
- Agendamento (Vercel): conforme `vercel.json`, diariamente às `02:00` UTC.
- Proteção de idempotência: um ledger diário garante que cada dia seja consolidado no máximo uma vez.

### Modelos e Migrações

- Modelo: `DailyRollup` (Prisma) com chave única `dayStart` (UTC).
  - Campos: `id`, `dayStart` (unique), `status` (`pending` | `completed`), `source` (`vercel` | `manual`), `createdAt`, `updatedAt`.
- Tabelas mensais existentes:
  - `MonthlyUserAnalytics` com unique em `(userId, monthStart)`.
  - `MonthlyLinkAnalytics` com unique em `(userId, linkId, monthStart)`.

### Funcionamento do Cron e Idempotência

- Autorização:
  - Produção: chamado pela Vercel com o header `x-vercel-cron`.
  - Desenvolvimento/Manual: use `token` via query string que deve bater com `CRON_SECRET` no `.env`.
- Parâmetros suportados:
  - `token`: obrigatório para execução manual. Define autorização quando igual a `CRON_SECRET`.
  - `date`: apenas em desenvolvimento, formato `YYYY-MM-DD` (UTC). Ignorado em produção.
- Intervalo consolidado: por padrão, o dia anterior (UTC). Com `date`, consolida aquele dia.
- Ledger diário `DailyRollup`:
  - Antes de consolidar, marca o dia como `pending`.
  - Se já existir `completed`, retorna `alreadyProcessed: true` e não duplica.
  - Se estiver `pending`, retorna `inProgress: true` e não começa uma segunda consolidação.
- Agregações feitas:
  - Cliques por `userId/linkId` (tabela `LinkClick`).
  - Views por `userId` (tabela `ProfileView`).
  - Cliques por `userId` (tabela `LinkClick`).
- Upserts paralelos:
  - `MonthlyLinkAnalytics` e `MonthlyUserAnalytics` são atualizados em paralelo via `Promise.all`.

### Testes rápidos (desenvolvimento)

Assumindo `.env` com `CRON_SECRET=seu-segredo`, execute:

```sh
# Consolida ontem em dev
curl "http://localhost:3000/api/cron/rollups?token=seu-segredo"

# Consolida um dia específico (UTC)
curl "http://localhost:3000/api/cron/rollups?token=seu-segredo&date=2025-10-27"

# Segunda chamada do mesmo dia retorna idempotente
curl "http://localhost:3000/api/cron/rollups?token=seu-segredo&date=2025-10-27"
```

Respostas esperadas:

- `alreadyProcessed: true` quando o ledger está `completed` para o dia.
- `inProgress: true` quando uma execução está marcada como `pending`.
- `ok: true` com `updatedLinkRollups` e `updatedUserRollups` quando consolidação completou.

### Observações de Segurança e Operação

- Em produção, o parâmetro `date` é ignorado; apenas o dia anterior é consolidado.
- O ledger diário protege de duplicação por dia, sem alterar as garantias únicas mensais já existentes.

### Falhas e Retentativas

- Estados de execução: `pending` (em andamento), `completed` (concluído) e `failed` (falhou).
- Retentativas automáticas: 1-2 tentativas com backoff exponencial curto.
  - Exemplo de agenda: `2:00` → `2:05`.
- Persistência parcial: se parte dos dados do dia foi consolidada, não duplicar reprocessamentos — a idempotência garante consistência.
- Alerta: enviar notificação para `contato@bionk.me` caso todas as tentativas falhem.
- Reexecução manual em desenvolvimento: use `token` + `date` para tentar novamente o dia específico.
  - `curl "http://localhost:3000/api/cron/rollups?token=seu-segredo&date=YYYY-MM-DD"`

## 🛡️ Licença

Este projeto está licenciado sob a **CC BY-NC**. Sinta-se à vontade para contribuir e testar, o **uso comercial não é permitido**.

---

Feito com ❤️ por [Gabriel Gonçalves](https://gabriellucasvh.vercel.app/)

