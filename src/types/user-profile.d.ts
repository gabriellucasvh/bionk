// src/types/user-profile.ts
export interface UserLink {
    id: number;
    url: string;
    title: string;
    sensitive?: boolean;
    active?: boolean;
    order?: number;
    // adicione outros campos conforme necessário
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
    // adicione outros campos do usuário
  }
  
  export interface TemplateComponentProps {
    user: UserProfile;
  }