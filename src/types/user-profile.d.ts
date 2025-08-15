// src/types/user-profile.ts
export interface UserLink {
	id: number;
	url: string;
	title: string;
	sensitive: boolean;
	active: boolean;
	order: number;
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

export enum SocialPlatform {
	Instagram = "instagram",
	Twitter = "twitter",
	LinkedIn = "linkedin",
	GitHub = "github",
	Facebook = "facebook",
	TikTok = "tiktok",
	YouTube = "youtube",
	Twitch = "twitch",
	Discord = "discord",
	Website = "website",
}

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
