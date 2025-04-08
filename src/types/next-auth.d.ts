import { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateUniqueUsername } from "@/utils/generateUsername";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  trustHost: true, // importante na Vercel para aceitar o domínio corretamente
  adapter: PrismaAdapter(prisma),
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true, // importante em produção (https)
      },
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
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

        return isValid ? { ...user, username: user.username ?? undefined } : null;
      },
    }),
  ],
  pages: {
    signIn: "/registro",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? undefined;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email ?? "";
      }
      return session;
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/dashboard/perfil`;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.username && user.name) {
        const username = await generateUniqueUsername(user.name);
        await prisma.user.update({
          where: { id: user.id },
          data: { username },
        });
      }
    },
  },
};
