// src/types/user-profile.d.ts
import type {
	CustomPresets as PrismaCustomPresets,
	Link as PrismaLink,
	Section as PrismaSection,
	SocialLink as PrismaSocialLink,
	Text as PrismaText,
	Video as PrismaVideo,
	Image as PrismaImage,
	Music as PrismaMusic,
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
	shareAllowed?: boolean | null;
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

// --- Imagens ---
export type ImageItemMeta = {
    url: string;
    previewUrl?: string;
    provider?: string;
    authorName?: string;
    authorLink?: string;
    sourceLink?: string;
    linkUrl?: string;
};

export interface UserImage extends PrismaImage {
    // items é Json no Prisma; aqui tipamos para uso no front
    items: ImageItemMeta[];
    section?: {
        id: number;
        title: string;
    } | null;
}

// --- Músicas ---
export interface UserMusic extends PrismaMusic {
	section?: {
		id: number;
		title: string;
	} | null;
}

// --- Customização ---
export interface CustomPresets extends PrismaCustomPresets {
    customBackgroundColor: string;
    customBackgroundGradient: string;
    customBackgroundMediaType?: "image" | "video" | "" | null;
    customBackgroundImageUrl?: string | null;
    customBackgroundVideoUrl?: string | null;
    customTextColor: string;
    customFont: string;
    customButton: string;
    customButtonStyle: string;
    customButtonFill: string;
	customButtonCorners: string;
	customButtonColor: string;
	customButtonTextColor: string;
	headerStyle: string;
	customBlurredBackground: boolean;
}

// --- Perfil Principal ---
export type UserProfile = PrismaUser & {
	// CORREÇÃO: Revertido para 'Section' e 'Link' (maiúsculas) para corresponder ao seu schema Prisma
	Section: UserSection[];
	Link: UserLink[];
	SocialLink: SocialLink[];
	Text: UserText[];
	Video: UserVideo[];
	Image: UserImage[];
	Music: UserMusic[];
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
