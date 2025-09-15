// src/app/(private)/studio/links/types/content.types.ts

export type ContentType = 
  | 'link'
  | 'section'
  | 'image'
  | 'video'
  | 'music'
  | 'text'
  | 'social-feed'
  | 'contact-form'
  | 'integration';

export type ImageContentType = 'carousel' | 'individual' | 'columns';

export type MusicPlatform = 
  | 'spotify'
  | 'apple-music'
  | 'soundcloud'
  | 'bandcamp'
  | 'deezer'
  | 'youtube-music';

export type SocialFeedPlatform = 'instagram' | 'twitter' | 'tiktok';

export type IntegrationType = 
  | 'calendar'
  | 'newsletter'
  | 'payment'
  | 'analytics'
  | 'custom'
  | 'zapier'
  | 'webhook'
  | 'embed'
  | 'ecommerce';

export interface ContentCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

export interface QuickAddItem {
  type: ContentType;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description?: string;
}

export interface ContentFormData {
  // Link data
  title?: string;
  url?: string;
  sectionId?: number | null;
  badge?: string;
  password?: string;
  expiresAt?: Date;
  deleteOnClicks?: number;
  launchesAt?: Date;
  
  // Image data
  imageType?: ImageContentType;
  images?: File[];
  imageUrls?: string[];
  
  // Video data
  videoUrl?: string;
  videoTitle?: string;
  
  // Music data
  musicPlatform?: MusicPlatform;
  musicUrl?: string;
  musicTitle?: string;
  
  // Text data
  textContent?: string;
  textFormatting?: 'plain' | 'markdown' | 'rich';
  
  // Social feed data
  socialPlatform?: SocialFeedPlatform;
  socialUsername?: string;
  feedLimit?: number;
  
  // Contact form data
  formFields?: FormField[];
  formTitle?: string;
  
  // Integration data
  integrationType?: IntegrationType;
  integrationConfig?: Record<string, any>;
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select fields
}