import { useCallback, useEffect, useState } from "react";
import type { SocialLinkItem } from "@/types/social";

interface User {
	name: string;
	username: string;
	bio?: string;
	image?: string;
}

interface UserData {
	name: string;
	username: string;
	bio?: string;
	image?: string;
	socialLinks: SocialLinkItem[];
}

interface ProfileState {
	name: string;
	username: string;
	bio: string;
}

export const useProfileData = (userId?: string, sessionImage?: string) => {
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
		name: "",
		username: "",
		bio: "",
		image: "",
		socialLinks: [],
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

			const socialRes = await fetch(`/api/social-links?userId=${userId}`);
			const socialData = await socialRes.json();
			const socialLinks = socialData?.socialLinks || [];

			const profileData = { name, username, bio: bio || "" };
			setProfile(profileData);
			setOriginalProfile(profileData);

			setUserData({
				name,
				username,
				bio: bio || "",
				image: currentImage,
				socialLinks,
			});

			return currentImage;
		} catch {
			const fallbackUrl =
				sessionImage ||
				"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png";

			setUserData({
				name: "",
				username: "",
				bio: "",
				image: fallbackUrl,
				socialLinks: [],
			});

			return fallbackUrl;
		} finally {
			setIsProfileLoading(false);
		}
	}, [userId, sessionImage]);

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
