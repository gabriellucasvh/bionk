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
  }
  
  export interface TemplateComponentProps {
    user: UserProfile;
  }