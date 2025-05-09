import type { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import type { User } from 'next-auth'
import { generateUniqueUsername } from '@/utils/generateUsername'

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  throw new Error("Missing Google OAuth environment variables");
}


interface ExtendedUser extends User {
  id: string
  username: string
  name?: string
}
export const authOptions: NextAuthOptions = {
  adapter: {
    ...PrismaAdapter(prisma),
    // Sobrescreve createUser para gerar username para OAuth
    createUser: async (data: { name?: string; email: string }) => {
      const username = await generateUniqueUsername(data.name ?? 'user');
      return prisma.user.create({
        data: {
          ...data,
          username,
          image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1746226087/bionk/defaults/profile.png",
        },
      });
    },
  },
  cookies:
    process.env.NODE_ENV === 'production'
      ? {
        sessionToken: {
          name: '__Secure-next-auth.session-token',
          options: {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: true,
          },
        },
      }
      : undefined,

  providers: [
    GoogleProvider({
      clientId,
      clientSecret,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.hashedPassword) return null

        const isValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        )

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name ?? undefined,
        }
      },
    }),
  ],
  pages: {
    signIn: '/registro',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account, trigger, session: updateSessionData }) { // Adiciona trigger e session
      const u = user as ExtendedUser;

      // Na autenticação inicial ou vinculação de conta
      if (user) {
        token.id = user.id;
        token.email = user.email ?? undefined;
        token.username = u.username;
        token.name = u.name;
        token.picture = user.image ?? undefined;
      }
      if (account) { // account is only available on successful sign-in
        token.accessToken = account.access_token;
        // Armazena se o login foi feito via 'credentials'
        token.isCredentialsUser = account.provider === 'credentials';
      }

      // Se updateSession foi chamado no cliente
      if (trigger === "update" && updateSessionData?.user) {
        // Atualiza o token com os dados passados para updateSession
        token.name = updateSessionData.user.name;
        token.username = updateSessionData.user.username;
        token.picture = updateSessionData.user.image;
        // Opcional: Re-buscar do DB para garantir consistência, mas updateSessionData deve bastar.
        // const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
        // if (dbUser) {
        //   token.name = dbUser.name;
        //   token.username = dbUser.username;
        //   token.picture = dbUser.image;
        // }
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        email: token.email ?? '',
        username: token.username as string,
        name: token.name as string,
        image: token.picture ?? null,
        // Passa a informação para o objeto da sessão do cliente
        isCredentialsUser: token.isCredentialsUser as boolean | undefined,
      };
      return session;
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/dashboard/perfil`
    },
  },
  // O evento createUser foi removido. A geração de username para novos usuários
  // via Credentials é feita na rota /api/auth/register.
  // Para provedores OAuth, o adapter tentará criar o usuário.
  // Como 'username' é obrigatório no schema, a criação falhará se o provedor
  // não fornecer um username e o adapter não o gerar. Idealmente, o adapter
  // ou um callback personalizado deveria lidar com a geração se ausente.
  // Por agora, confiamos que o provedor (Google) fornece dados suficientes
  // ou que o registro via Credentials é o fluxo principal para usuários sem username inicial.
}
