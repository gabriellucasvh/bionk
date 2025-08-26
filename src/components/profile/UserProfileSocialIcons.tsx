// src/components/profile/UserProfileSocialIcons.tsx
"use client";

import { SOCIAL_PLATFORMS } from '@/config/social-platforms';
import { SocialLinkItem } from '@/types/social';
import Link from 'next/link';

interface UserProfileSocialIconsProps {
  socialLinks: SocialLinkItem[];
  iconSize?: number;
  className?: string;
  theme?: 'light' | 'dark';
}

const UserProfileSocialIcons: React.FC<UserProfileSocialIconsProps> = ({
  socialLinks,
  iconSize = 24,
  className = '',
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
            <div
              className="hover:opacity-80 transition-opacity"
              style={{
                width: iconSize,
                height: iconSize,
                backgroundColor: 'currentColor',
                maskImage: `url(${platform.icon})`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
              }}
            />
          </Link>
        );
      })}
    </div>
  );
};

export default UserProfileSocialIcons;
