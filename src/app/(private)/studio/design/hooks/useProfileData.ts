import { useCallback, useEffect, useState } from "react";
import type { SocialLinkItem } from "@/types/social";
import type {
	UserImage,
	UserLink,
	UserText,
	UserVideo,
} from "@/types/user-profile";

interface User {
	name: string;
	username: string;
	bio?: string;
	image?: string;
}

interface UserData {
	id: string;
	name: string;
	username: string;
	bio: string;
	image: string;
	socialLinks: SocialLinkItem[];
	Link: UserLink[];
	Text: UserText[];
	Video: UserVideo[];
	SocialLink: SocialLinkItem[];
	Image: UserImage[];
}

interface ProfileState {
	name: string;
	username: string;
	bio: string;
}

export const useProfileData = (
	userId?: string,
	sessionImage?: string,
	options?: { profileOnly?: boolean }
) => {
	const [profile, setProfile] = useState<ProfileState>({
		name: "",
		username: "",
		bio: "",
	});
	const [originalProfile, setOriginalProfile] = useState<ProfileState>({
		name: "",
		username: "",
		bio: "",
	});
	const [userData, setUserData] = useState<UserData>({
		id: "",
		name: "",
		username: "",
		bio: "",
		image: "",
		socialLinks: [],
		Link: [],
		Text: [],
		Video: [],
		SocialLink: [],
		Image: [],
	});
	const [isProfileLoading, setIsProfileLoading] = useState(true);

	const fetchProfile = useCallback(async () => {
		if (!userId) {
			return;
		}

		setIsProfileLoading(true);
		try {
			const res = await fetch(`/api/profile/${userId}`);
			const { name = "", username = "", bio = "", image } = await res.json();
			const currentImage =
				image ||
				sessionImage ||
				"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png";

			let socialLinks: SocialLinkItem[] = [];
			let userLinks: UserLink[] = [];
			let userTexts: UserText[] = [];
			let userVideos: UserVideo[] = [];
			let userImages: UserImage[] = [];

			// When not in profile-only mode, fetch additional user content
			if (!options?.profileOnly) {
				const socialRes = await fetch(`/api/social-links?userId=${userId}`);
				const socialData = await socialRes.json();
				socialLinks = socialData?.socialLinks || [];

				const linksRes = await fetch(`/api/links?userId=${userId}`);
				const linksData = await linksRes.json();
				userLinks = linksData?.links || [];

				const textsRes = await fetch("/api/texts");
				const textsData = await textsRes.json();
				userTexts = textsData?.texts || [];

				const videosRes = await fetch("/api/videos");
				const videosData = await videosRes.json();
				userVideos = videosData?.videos || [];

				const imagesRes = await fetch("/api/images");
				const imagesData = await imagesRes.json();
				userImages = imagesData?.images || [];
			}

			const profileData = { name, username, bio: bio || "" };
			setProfile(profileData);
			setOriginalProfile(profileData);

			setUserData({
				id: userId,
				name,
				username,
				bio: bio || "",
				image: currentImage,
				socialLinks,
				Link: userLinks,
				Text: userTexts,
				Video: userVideos,
				SocialLink: socialLinks,
				Image: userImages,
			});

			return currentImage;
		} catch {
			const fallbackUrl =
				sessionImage ||
				"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png";

			setUserData({
				id: "",
				name: "",
				username: "",
				bio: "",
				image: fallbackUrl,
				socialLinks: [],
				Link: [],
				Text: [],
				Video: [],
				SocialLink: [],
				Image: [],
			});

			return fallbackUrl;
		} finally {
			setIsProfileLoading(false);
		}
	}, [userId, sessionImage, options?.profileOnly]);

	const updateProfileText = useCallback(async (): Promise<User | null> => {
		if (!userId) {
			return null;
		}

		try {
			const res = await fetch(`/api/profile/${userId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(profile),
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || "Falha ao atualizar");
			}
			return data as User;
		} catch {
			return null;
		}
	}, [userId, profile]);

	useEffect(() => {
		fetchProfile();
	}, [fetchProfile]);

	return {
		profile,
		setProfile,
		originalProfile,
		setOriginalProfile,
		userData,
		setUserData,
		isProfileLoading,
		updateProfileText,
		fetchProfile,
	};
};
