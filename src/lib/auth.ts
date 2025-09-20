import crypto from "node:crypto";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { discordWebhook } from "@/lib/discord-webhook";
import prisma from "@/lib/prisma";

// Funções auxiliares para JWT
function setupInitialToken(token: any, user: ExtendedUser, account: any) {
	token.id = user.id;
	token.email = user.email ?? undefined;
	token.username = user.username;
	token.name = user.name;
	token.picture = user.image ?? undefined;
	token.onboardingCompleted = user.onboardingCompleted;
	token.status = user.status;
	token.isBanned = user.isBanned;
	token.banReason = user.banReason;
	token.bannedAt = user.bannedAt;

	if (account?.provider === "google" && account.providerAccountId) {
		token.googleId = account.providerAccountId;
		token.provider = "google";
	} else if (account?.provider === "credentials") {
		token.provider = "credentials";
	}
}

function setupAccountData(token: any, account: any) {
	token.accessToken = account.access_token;
	token.isCredentialsUser = account.provider === "credentials";
}

function shouldUpdateUserData(token: any): boolean {
	return (
		token.id &&
		(token.status === "pending" ||
			!token.onboardingCompleted ||
			token.isBanned === undefined)
	);
}

// Cache para evitar consultas desnecessárias ao banco
const tokenCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

async function updateTokenFromDatabase(token: any) {
	try {
		const userId = token.id as string;
		const now = Date.now();

		// Verificar se temos dados em cache válidos
		const cached = tokenCache.get(userId);
		if (cached && now - cached.timestamp < CACHE_DURATION) {
			// Usar dados do cache
			Object.assign(token, cached.data);
			return;
		}

		const dbUser = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				onboardingCompleted: true,
				image: true,
				status: true,
				isBanned: true,
				banReason: true,
				bannedAt: true,
			},
		});

		if (dbUser) {
			const userData: any = {
				onboardingCompleted: dbUser.onboardingCompleted,
				status: dbUser.status,
				isBanned: dbUser.isBanned,
				banReason: dbUser.banReason,
				bannedAt: dbUser.bannedAt,
			};

			// Só atualizar a imagem se o usuário já completou o onboarding
			if (dbUser.onboardingCompleted && dbUser.image) {
				userData.picture = dbUser.image;
			}

			// Atualizar token
			Object.assign(token, userData);

			// Salvar no cache
			tokenCache.set(userId, { data: userData, timestamp: now });
		}
	} catch (error) {
		console.error("Erro ao buscar dados do usuário:", error);
	}
}

// Função para limpar cache quando necessário
export function clearUserTokenCache(userId: string) {
	tokenCache.delete(userId);
}

function updateTokenFromSession(token: any, sessionUser: any) {
	token.name = sessionUser.name;
	token.username = sessionUser.username;
	token.picture = sessionUser.image;
	token.onboardingCompleted = sessionUser.onboardingCompleted;
}

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
	onboardingCompleted?: boolean;
	provider?: string;
	status?: string;
	isBanned?: boolean;
	banReason?: string;
	bannedAt?: Date;
}

export const authOptions: NextAuthOptions = {
	adapter: {
		...PrismaAdapter(prisma),
		createUser: async (data: {
			name?: string;
			email: string;
			sub?: string;
			picture?: string;
			provider?: string;
		}) => {
			// CORREÇÃO: A imagem já virá em alta resolução do 'profile'
			const imageUrl =
				data.picture ??
				"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png";

			// Determinar status e username baseado no provider
			const isGoogleProvider = data.provider === "google" || (data as any).sub;
			const status = isGoogleProvider ? "pending" : "active";
			const username = isGoogleProvider
				? `temp_${crypto.randomUUID().slice(0, 8)}`
				: `user_${crypto.randomUUID().slice(0, 8)}`;

			const newUser = await prisma.user.create({
				data: {
					email: data.email,
					name: data.name || "Usuário",
					username,
					status,
					image: imageUrl,
					googleId: (data as any).sub ?? null,
					provider: "google",
					emailVerified: new Date(),
					onboardingCompleted: false, // Usuários Google precisam completar onboarding
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
			} catch {
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
				const highResImage = profile.picture?.replace(
					GOOGLE_IMAGE_SIZE_REGEX,
					"=s512-c"
				);

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

				// Verificar se o usuário está banido
				if (user.isBanned) {
					throw new Error("Conta banida");
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
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 dias
		updateAge: 24 * 60 * 60, // 24 horas
	},
	secret: process.env.NEXTAUTH_SECRET,
	callbacks: {
		async jwt({ token, user, account, trigger, session: updateSessionData }) {
			// Configurar token inicial com dados do usuário
			if (user) {
				setupInitialToken(token, user as ExtendedUser, account);
			}

			// Configurar dados da conta
			if (account) {
				setupAccountData(token, account);
			}

			// Só atualizar dados do usuário quando necessário
			if (token.id && shouldUpdateUserData(token)) {
				await updateTokenFromDatabase(token);
			}

			// Processar atualizações de sessão
			if (trigger === "update" && updateSessionData?.user) {
				updateTokenFromSession(token, updateSessionData.user);
				// Limpar cache quando sessão é atualizada
				if (token.id) {
					clearUserTokenCache(token.id as string);
				}
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
				onboardingCompleted: token.onboardingCompleted as boolean | undefined,
				provider: token.provider as string | undefined,
				status: token.status as string | undefined,
				banido: token.isBanned as boolean | undefined,
				isBanned: token.isBanned as boolean | undefined,
				banReason: token.banReason as string | undefined,
				bannedAt: token.bannedAt as Date | undefined,
			};
			return session;
		},
		redirect({ baseUrl, url }) {
			if (
				url.includes("/api/auth/error?error=OAuthAccountNotLinked") ||
				url.includes("&error=OAuthAccountNotLinked")
			) {
				return Promise.resolve(`${baseUrl}/login?error=OAuthAccountNotLinked`);
			}

			if (
				url.startsWith(`${baseUrl}/registro`) ||
				url.startsWith(`${baseUrl}/login`)
			) {
				const callbackUrl = new URL(url).searchParams.get("callbackUrl");
				if (callbackUrl) {
					return Promise.resolve(callbackUrl);
				}
				return Promise.resolve(`${baseUrl}/studio/perfil`);
			}

			if (new URL(url, baseUrl).searchParams.has("callbackUrl")) {
				return Promise.resolve(url);
			}

			return Promise.resolve(`${baseUrl}/studio/perfil`);
		},
	},
};
