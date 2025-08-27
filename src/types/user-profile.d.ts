// src/types/user-profile.ts
export interface UserLink {
	id: number;
	url: string;
	title: string;
	sensitive: boolean;
	active: boolean;
	order: number;

	badge?: string | null;
	password?: string | null;
	sectionTitle?: string | null;
	expiresAt?: string | null;
	deleteOnClicks?: number | null;
	launchesAt?: string | null;
}

export interface UserProfile {
	id: string;
	username: string;
	name?: string;
	image?: string;
	bio?: string;
	template?: string;
	templateCategory?: string;
	Link: UserLink[];
	SocialLink?: SocialLink[];
	CustomPresets?: CustomPresets;
}

export interface SocialLink {
	id: string;
	platform: SocialPlatform; 
	url: string;
}

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

export interface TemplateComponentProps {
	user: UserProfile & {
		CustomPresets?: CustomPresets;
	};
}

export interface CustomPresets {
	customBackgroundColor: string;
	customBackgroundGradient: string;
	customTextColor: string;
	customFont: string;
	customButton: string;
	customButtonFill: string;
	customButtonCorners: string;
}
