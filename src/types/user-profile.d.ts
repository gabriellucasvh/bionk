// src/types/user-profile.d.ts
import type {
	CustomPresets as PrismaCustomPresets,
	Link as PrismaLink,
	Section as PrismaSection,
	SocialLink as PrismaSocialLink,
	User as PrismaUser,
} from "@prisma/client";

// --- Links e Seções ---
export interface UserLink extends PrismaLink {
	badge?: string | null;
	password?: string | null;
	sectionTitle?: string | null;
	type?: 'link' | 'section' | null;
	expiresAt?: string | null;
	deleteOnClicks?: number | null;
	launchesAt?: string | null;
	customImageUrl?: string | null;
}

export type UserSection = PrismaSection & {
	links: UserLink[];
};

// --- Redes Sociais ---
export type SocialPlatform =
	| "instagram"
	| "twitter"
	| "linkedin"
	| "github"
	| "facebook"
	| "tiktok"
	| "youtube"
	| "twitch"
	| "discord"
	| "website";

export interface SocialLink extends PrismaSocialLink {
	platform: SocialPlatform;
}

// --- Customização ---
export interface CustomPresets extends PrismaCustomPresets {
	customBackgroundColor: string;
	customBackgroundGradient: string;
	customTextColor: string;
	customFont: string;
	customButton: string;
	customButtonFill: string;
	customButtonCorners: string;
}

// --- Perfil Principal ---
export type UserProfile = PrismaUser & {
	// CORREÇÃO: Revertido para 'Section' e 'Link' (maiúsculas) para corresponder ao seu schema Prisma
	Section: UserSection[];
	Link: UserLink[];
	SocialLink: SocialLink[];
	CustomPresets?: CustomPresets | null;

	template?: string;
	templateCategory?: string;
};

// --- Props para Templates ---
export interface TemplateComponentProps {
	user: UserProfile;
}
