export interface SocialLinkItem {
	id: string;
	platform: string;
	username?: string;
	url: string;
	userId?: string;
	order?: number;
	active?: boolean;
}

export interface SocialPlatform {
    key: string;
    name: string;
    icon: string;
    iconDark?: string; 
    baseUrl: string;
    placeholder: string;
    color: string;
    pattern?: string;
}
