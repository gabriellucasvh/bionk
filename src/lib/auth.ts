import prisma from "@/lib/prisma";
import { generateUniqueUsername } from "@/utils/generateUsername";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!(clientId && clientSecret)) {
	throw new Error("Missing Google OAuth environment variables");
}

interface ExtendedUser extends User {
	id: string;
	username: string;
	name?: string;
	googleId?: string;
}

interface Token extends Record<string, any> {
	id: string;
	email: string | undefined;
	username: string;
	name?: string;
	picture?: string | null;
	googleId?: string;
	isCredentialsUser?: boolean;
}

export const authOptions: NextAuthOptions = {
	adapter: {
		...PrismaAdapter(prisma),
		createUser: async (data: {
			name?: string;
			email: string;
			sub?: string;
			picture?: string;
		}) => {
			const username = await generateUniqueUsername(data.name ?? "user");
			return prisma.user.create({
				data: {
					email: data.email,
					name: data.name,
					username,
					image:
						data.picture ??
						"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1746226087/bionk/defaults/profile.png",
					googleId: (data as any).sub ?? null,
					provider: "google",
					emailVerified: new Date(),
				},
			});
		},
	},

	cookies:
		process.env.NODE_ENV === "production"
			? {
					sessionToken: {
						name: "__Secure-next-auth.session-token",
						options: {
							httpOnly: true,
							sameSite: "lax",
							path: "/",
							secure: true,
						},
					},
				}
			: undefined,

	providers: [
		GoogleProvider({
			clientId,
			clientSecret,
			async profile(profile) {
				return {
					...profile,
					id: profile.sub,
					name: profile.name,
					email: profile.email,
					image: profile.picture,
					googleId: profile.sub,
				};
			},
		}),
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!(credentials?.email && credentials?.password)) return null;

				const user = await prisma.user.findUnique({
					where: { email: credentials.email },
				});

				if (!(user && user.hashedPassword)) return null;

				const isValid = await bcrypt.compare(
					credentials.password,
					user.hashedPassword
				);

				if (!isValid) return null;

				return {
					id: user.id,
					email: user.email,
					username: user.username,
					name: user.name ?? undefined,
				};
			},
		}),
	],
	pages: {
		signIn: "/registro",
	},
	session: { strategy: "jwt" },
	secret: process.env.NEXTAUTH_SECRET,
	callbacks: {
		async jwt({ token, user, account, trigger, session: updateSessionData }) {
			const u = user as ExtendedUser;

			if (user) {
				token.id = user.id;
				token.email = user.email ?? undefined;
				token.username = u.username;
				token.name = u.name;
				token.picture = user.image ?? undefined;
				if (account?.provider === "google" && account.providerAccountId) {
					token.googleId = account.providerAccountId;
				}
			}
			if (account) {
				token.accessToken = account.access_token;
				token.isCredentialsUser = account.provider === "credentials";
			}

			if (trigger === "update" && updateSessionData?.user) {
				token.name = updateSessionData.user.name;
				token.username = updateSessionData.user.username;
				token.picture = updateSessionData.user.image;
			}

			return token;
		},
		async session({ session, token }) {
			session.user = {
				...session.user,
				id: token.id as string,
				email: token.email ?? "",
				username: token.username as string,
				name: token.name as string,
				image: token.picture ?? null,
				isCredentialsUser: token.isCredentialsUser as boolean | undefined,
				googleId: token.googleId ?? undefined,
			};
			return session;
		},
		async redirect({ baseUrl, url }) {
			// Verifica se a URL de callback contém o erro OAuthAccountNotLinked
			if (
				url.includes("/api/auth/error?error=OAuthAccountNotLinked") ||
				url.includes("&error=OAuthAccountNotLinked")
			) {
				return `${baseUrl}/login?error=OAuthAccountNotLinked`;
			}
			// Verifica se a URL de callback é a página de signIn e não contém erro, então redireciona para o callbackUrl ou studio
			if (
				url.startsWith(baseUrl + "/registro") ||
				url.startsWith(baseUrl + "/login")
			) {
				const callbackUrl = new URL(url).searchParams.get("callbackUrl");
				if (callbackUrl) {
					return callbackUrl;
				}
				return `${baseUrl}/studio/perfil`;
			}
			// Se houver uma URL de callback na query, usa ela
			if (new URL(url, baseUrl).searchParams.has("callbackUrl")) {
				return url;
			}
			// Comportamento padrão para outros casos
			return `${baseUrl}/studio/perfil`;
		},
	},
};
