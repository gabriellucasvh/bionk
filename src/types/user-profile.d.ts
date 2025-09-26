// src/types/user-profile.d.ts
import type {
	CustomPresets as PrismaCustomPresets,
	Link as PrismaLink,
	Section as PrismaSection,
	SocialLink as PrismaSocialLink,
	Text as PrismaText,
	Video as PrismaVideo,
	User as PrismaUser,
} from "@prisma/client";

// --- Links e Seções ---
export interface UserLink extends PrismaLink {
	badge?: string | null;
	password?: string | null;
	sectionId?: number | null;
	section?: {
		id: number;
		title: string;
	} | null;
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

// --- Textos ---
export interface UserText extends PrismaText {
	id: number;
	title: string;
	description: string;
	order: number;
	active: boolean;
	userId: string;
	isCompact: boolean;
	position: string;
	hasBackground: boolean;
}

// --- Vídeos ---
export interface UserVideo extends PrismaVideo {
	id: number;
	title?: string;
	description?: string;
	type: string;
	url: string;
	order: number;
	active: boolean;
	userId: string;
}

// --- Customização ---
export interface CustomPresets extends PrismaCustomPresets {
	customBackgroundColor: string;
	customBackgroundGradient: string;
	customTextColor: string;
	customFont: string;
	customButton: string;
	customButtonStyle: string;
	customButtonFill: string;
	customButtonCorners: string;
	customButtonColor: string;
	customButtonTextColor: string;
	headerStyle: string;
}

// --- Perfil Principal ---
export type UserProfile = PrismaUser & {
	// CORREÇÃO: Revertido para 'Section' e 'Link' (maiúsculas) para corresponder ao seu schema Prisma
	Section: UserSection[];
	Link: UserLink[];
	SocialLink: SocialLink[];
	Text: UserText[];
	Video: UserVideo[];
	CustomPresets?: CustomPresets | null;

	template?: string;
	templateCategory?: string;
	isBanned?: boolean;
	banReason?: string | null;
	bannedAt?: Date | null;
};

// --- Props para Templates ---
export interface TemplateComponentProps {
	user: UserProfile;
}
