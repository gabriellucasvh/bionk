// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { CallbacksOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { JWT } from "next-auth/jwt";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );
        return isValid ? user : null;
      },
    }),
  ],
  pages: {
    signIn: "/registro",
  },
  session: { strategy: "jwt" as const },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }: { token: JWT; user?: any; account?: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      if (account) {
        token.acessToken = account.acess_token;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.email = token.email;
      }
      return session;
    },
    async redirect({ baseUrl }: Parameters<CallbacksOptions["redirect"]>[0]): Promise<string> {
      // Redireciona para /dashboard/perfil após login com Google.
      // Esse callback é aplicado a todas as autenticações; se necessário,
      // você pode condicionar o redirecionamento verificando o tipo de provedor
      return `${baseUrl}/dashboard/perfil`;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
