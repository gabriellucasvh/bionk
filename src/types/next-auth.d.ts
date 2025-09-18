import "next-auth";
import "next-auth/jwt";
import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
	/**
	 * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
	 */
	interface Session {
		user: {
			id: string;
			username: string;
			name?: string | null;
			email?: string | null;
			image?: string | null;
			isCredentialsUser?: boolean;
			googleId?: string; // Adicionado googleId
			onboardingCompleted?: boolean;
			provider?: string;
			status?: string;
			banido?: boolean;
			isBanned?: boolean;
			banReason?: string;
			bannedAt?: Date;
		} & DefaultSession["user"];
	}

	interface User extends DefaultUser {
		id: string;
		username: string;
		name?: string | null;
		email?: string | null;
		image?: string | null;
		isCredentialsUser?: boolean;
		googleId?: string; // Adicionado googleId
		onboardingCompleted?: boolean;
		provider?: string;
		status?: string;
		banido?: boolean;
		isBanned?: boolean;
		banReason?: string;
		bannedAt?: Date;
	}
}

declare module "next-auth/jwt" {
	/** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
	interface JWT {
		id: string;
		username: string;
		name?: string | null;
		email?: string | null; // Adicionado para consistência, embora o token já tenha email
		picture?: string | null;
		isCredentialsUser?: boolean;
		googleId?: string; // Adicionado googleId
		onboardingCompleted?: boolean;
		provider?: string;
		status?: string;
		accessToken?: string; // Mantido se já estava em uso
		isBanned?: boolean;
		banReason?: string;
		bannedAt?: Date;
	}
}
