// src/components/profile/UserProfileSocialIcons.tsx
"use client";

import Link from "next/link";
import { SOCIAL_PLATFORMS } from "@/config/social-platforms";
import type { SocialLink } from "@/types/user-profile";

interface UserProfileSocialIconsProps {
	socialLinks: SocialLink[];
	iconSize?: number;
	className?: string;
	theme?: "light" | "dark";
	customColor?: string;
}

const UserProfileSocialIcons: React.FC<UserProfileSocialIconsProps> = ({
	socialLinks,
	iconSize = 24,
	className = "",
	customColor,
}) => {
	if (!socialLinks || socialLinks.length === 0) {
		return null;
	}

	const activeLinks = socialLinks.filter((link) => link.active);

	if (activeLinks.length === 0) {
		return null;
	}

	return (
		<div
			className={`flex flex-wrap items-center justify-center space-x-3 ${className}`}
		>
			{activeLinks.map((link) => {
				const platform = SOCIAL_PLATFORMS.find((p) => p.key === link.platform);
				if (!platform) {
					return null;
				}

				return (
					<Link
						href={link.url}
						key={link.id}
						rel="noopener noreferrer"
						target="_blank"
						title={platform.name}
					>
						<div
							className="transition-opacity hover:opacity-80"
							style={{
								width: iconSize,
								height: iconSize,
								backgroundColor: customColor || "currentColor",
								maskImage: `url(${platform.icon})`,
								maskSize: "contain",
								maskRepeat: "no-repeat",
								maskPosition: "center",
							}}
						/>
					</Link>
				);
			})}
		</div>
	);
};

export default UserProfileSocialIcons;
