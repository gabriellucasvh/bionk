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

## 🛡️ Licença

Este projeto está licenciado sob a **CC BY-NC**. Sinta-se à vontade para contribuir e testar, o **uso comercial não é permitido**.

---

Feito com ❤️ por [Gabriel Gonçalves](https://gabriellucasvh.vercel.app/)

