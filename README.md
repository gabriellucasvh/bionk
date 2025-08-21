# Bionk

Bionk é uma plataforma **Link in Bio** moderna e personalizável, desenvolvida com **Next.js 15**, **Tailwind CSS** e **Prisma**. O projeto permite que usuários criem e personalizem suas próprias páginas de links, facilitando o compartilhamento de conteúdo online. Inclui sistema de assinaturas com integração ao Mercado Pago.

## ✨ Tecnologias Utilizadas

- **Next.js 15** - Framework React para aplicações modernas.
- **React 19** - Biblioteca para interfaces de usuário.
- **Tailwind CSS (v4)** - Estilização moderna e responsiva.
- **Prisma (PostgreSQL)** - ORM para manipulação do banco de dados.
- **NeonDB** - Banco de dados escalável baseado em PostgreSQL na nuvem.
- **Redis - Upstash** - Armazenamento em cache, gerenciamento de sessões e rate limiter.
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

5. Configure o token de acesso do Mercado Pago no arquivo `.env`:

   ```
   MERCADO_PAGO_ACCESS_TOKEN=seu-token-de-acesso
   ```

6. Execute o projeto em modo de desenvolvimento:

   ```sh
   npm run dev
   ```

## 💳 Integração com Mercado Pago

O projeto inclui integração completa com o Mercado Pago para processamento de pagamentos de assinaturas. Para configurar:

1. Crie uma conta no [Mercado Pago](https://www.mercadopago.com.br/)
2. Obtenha suas credenciais de acesso no painel de desenvolvedores
3. Configure o token de acesso no arquivo `.env`
4. Para testes, use o ambiente de sandbox do Mercado Pago

A integração suporta:
- Pagamentos de assinaturas mensais e anuais
- Webhooks para notificações de pagamento
- Redirecionamento após pagamento (sucesso, falha, pendente)

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

## 🛡️ Licença

Este projeto está licenciado sob a **CC BY-NC**. Sinta-se à vontade para contribuir, mas não para uso comercial.

---

Feito com ❤️ por [Gabriel Gonçalves](https://gabriellucasvh.vercel.app/)

