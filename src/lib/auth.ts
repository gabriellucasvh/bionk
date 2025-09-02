import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { discordWebhook } from "@/lib/discord-webhook";
import prisma from "@/lib/prisma";
import { generateUniqueUsername } from "@/utils/generateUsername";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

// Regex para substituir parâmetros de tamanho de imagem do Google
const GOOGLE_IMAGE_SIZE_REGEX = /=s\d+-c$/;

if (!(clientId && clientSecret)) {
	throw new Error("Missing Google OAuth environment variables");
}

interface ExtendedUser extends User {
	id: string;
	username: string;
	name?: string;
	googleId?: string;
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
			// CORREÇÃO: A imagem já virá em alta resolução do 'profile'
			const imageUrl =
				data.picture ??
				"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1746226087/bionk/defaults/profile.png";

			const newUser = await prisma.user.create({
				data: {
					email: data.email,
					name: data.name,
					username,
					image: imageUrl,
					googleId: (data as any).sub ?? null,
					provider: "google",
					emailVerified: new Date(),
					subscriptionPlan: "free",
					subscriptionStatus: "active",
				},
			});

			// Notificar Discord sobre novo registro via Google OAuth
			try {
				await discordWebhook.notifyRegistration({
					username: newUser.username || username,
					email: newUser.email,
					name: newUser.name || undefined,
					source: "google_oauth",
					plan: "free",
					metadata: {
						userId: newUser.id,
						timestamp: new Date().toISOString(),
						registrationMethod: "google_oauth",
						googleId: (data as any).sub ?? null,
					},
				});
			} catch  {
				// Não falha o registro se a notificação Discord falhar
			}

			return newUser;
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
			profile(profile) {
				// NOVO: Altera a URL da imagem para obter alta resolução (400px)
				const highResImage = profile.picture?.replace(GOOGLE_IMAGE_SIZE_REGEX, "=s512-c");

				return {
					...profile,
					id: profile.sub,
					name: profile.name,
					email: profile.email,
					image: highResImage, // Utiliza a nova URL de alta resolução
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
				if (!(credentials?.email && credentials?.password)) {
					return null;
				}

				const user = await prisma.user.findUnique({
					where: { email: credentials.email },
				});

				if (!user?.hashedPassword) {
					return null;
				}

				const isValid = await bcrypt.compare(
					credentials.password,
					user.hashedPassword
				);

				if (!isValid) {
					return null;
				}

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
		jwt({ token, user, account, trigger, session: updateSessionData }) {
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
		session({ session, token }) {
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
		redirect({ baseUrl, url }) {
			if (
				url.includes("/api/auth/error?error=OAuthAccountNotLinked") ||
				url.includes("&error=OAuthAccountNotLinked")
			) {
				return `${baseUrl}/login?error=OAuthAccountNotLinked`;
			}
			if (
				url.startsWith(`${baseUrl}/registro`) ||
				url.startsWith(`${baseUrl}/login`)
			) {
				const callbackUrl = new URL(url).searchParams.get("callbackUrl");
				if (callbackUrl) {
					return callbackUrl;
				}
				return `${baseUrl}/studio/perfil`;
			}
			if (new URL(url, baseUrl).searchParams.has("callbackUrl")) {
				return url;
			}
			return `${baseUrl}/studio/perfil`;
		},
	},
};
