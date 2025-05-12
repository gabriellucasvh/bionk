// src/components/profile/UserProfileSocialIcons.tsx
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { SocialLinkItem } from '@/types/social';
import { SOCIAL_PLATFORMS } from '@/config/social-platforms';

interface UserProfileSocialIconsProps {
  socialLinks: SocialLinkItem[];
  iconSize?: number;
  className?: string;
  theme?: 'light' | 'dark'; // Adicionada propriedade theme
}

const UserProfileSocialIcons: React.FC<UserProfileSocialIconsProps> = ({
  socialLinks,
  iconSize = 24,
  className = '',
  theme = 'light', // Define 'light' como tema padrão
}) => {
  if (!socialLinks || socialLinks.length === 0) {
    return null;
  }

  const activeLinks = socialLinks.filter(link => link.active);

  if (activeLinks.length === 0) {
    return null; 
  }

  return (
    <div className={`flex flex-wrap space-x-3 items-center justify-center ${className}`}>
      {activeLinks.map((link) => {
        const platform = SOCIAL_PLATFORMS.find((p) => p.key === link.platform);
        if (!platform) {
          return null; 
        }

        return (
          <Link href={link.url} key={link.id} target="_blank" rel="noopener noreferrer" title={platform.name}>
            <Image
              src={theme === 'dark' && platform.iconDark ? platform.iconDark : platform.icon}
              alt={platform.name}
              width={iconSize}
              height={iconSize}
              className="hover:opacity-80 transition-opacity"
            />
          </Link>
        );
      })}
    </div>
  );
};

export default UserProfileSocialIcons;