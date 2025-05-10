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
  iconDark?: string; // Adicionado para ícones de tema escuro
  baseUrl: string;
  placeholder: string;
}