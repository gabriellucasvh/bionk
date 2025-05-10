export interface SocialLinkItem {
  id: string;
  platform: string;
  username?: string; // Tornada opcional
  url: string;
  userId?: string;   // Tornada opcional
  order?: number;    // Tornada opcional
  active?: boolean;  // Tornada opcional
}

export interface SocialPlatform {
  key: string;
  name: string;
  icon: string;
  baseUrl: string;
  placeholder: string;
}