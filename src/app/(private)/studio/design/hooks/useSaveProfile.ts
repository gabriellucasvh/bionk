import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import {
	dispatchIframeReload,
	dispatchImageUpdateEvent,
	dispatchProfileEvents,
} from "../utils/profileUtils";

interface Profile {
	name: string;
	username: string;
	bio: string;
}

interface UseSaveProfileProps {
	profile: Profile;
	originalProfile: Profile;
	profileImageChanged: boolean;
	selectedProfileFile: File | null;
	validateBio: (bio: string) => boolean;
	validateUsername: (
		username: string,
		originalUsername: string
	) => Promise<boolean>;
	uploadImage: (file: File, userId: string) => Promise<string | null>;
	updateProfileText: (
		userId: string,
		profile: Profile,
		originalProfile: Profile,
		profileImageChanged: boolean
	) => Promise<any>;
	setOriginalProfile: (profile: Profile) => void;
	updateOriginalImageUrl: (url: string) => void;
	resetImageState: () => void;
	clearValidationErrors: () => void;
	animateButtonsOut: () => void;
}

export const useSaveProfile = ({
	profile,
	originalProfile,
	profileImageChanged,
	selectedProfileFile,
	validateBio,
	validateUsername,
	uploadImage,
	updateProfileText,
	setOriginalProfile,
	updateOriginalImageUrl,
	resetImageState,
	clearValidationErrors,
	animateButtonsOut,
}: UseSaveProfileProps) => {
	const { data: session, update } = useSession();
	const [loading, setLoading] = useState(false);
	const [usernameDebounceTimeout, setUsernameDebounceTimeout] =
		useState<NodeJS.Timeout | null>(null);

	const debouncedValidateUsername = useCallback(
		(username: string) => {
			if (usernameDebounceTimeout) {
				clearTimeout(usernameDebounceTimeout);
			}

			const timeout = setTimeout(async () => {
				if (username && username !== originalProfile.username) {
					await validateUsername(username, originalProfile.username);
				}
			}, 500);

			setUsernameDebounceTimeout(timeout);
		},
		[usernameDebounceTimeout, originalProfile.username, validateUsername]
	);

	useEffect(() => {
		return () => {
			if (usernameDebounceTimeout) {
				clearTimeout(usernameDebounceTimeout);
			}
		};
	}, [usernameDebounceTimeout]);

	const handleSaveProfile = async () => {
		const textChanged =
			profile.name !== originalProfile.name ||
			profile.username !== originalProfile.username ||
			profile.bio !== originalProfile.bio;
		const hasChanges = textChanged || profileImageChanged;

		if (!(session?.user?.id && hasChanges)) {
			return;
		}

		if (!validateBio(profile.bio)) {
			return;
		}

		if (!(await validateUsername(profile.username, originalProfile.username))) {
			return;
		}

		setLoading(true);

		let newImageUrl: string | null = null;
		let updatedUserData: any = null;

		if (selectedProfileFile) {
			newImageUrl = await uploadImage(selectedProfileFile, session.user.id);
			if (!newImageUrl) {
				setLoading(false);
				return;
			}
			// Atualiza os campos de texto após upload de imagem
			updatedUserData = await updateProfileText(
				session?.user?.id,
				profile,
				originalProfile,
				profileImageChanged
			);
		} else if (profileImageChanged) {
			// Remoção de imagem: define imagem para a URL padrão
			const defaultImageUrl =
				"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png";
			try {
				const res = await fetch(`/api/profile/${session.user.id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ ...profile, image: defaultImageUrl }),
				});
				const data = await res.json();
				if (!res.ok) {
					setLoading(false);
					return;
				}
				updatedUserData = data;
				newImageUrl = defaultImageUrl;
			} catch {
				setLoading(false);
				return;
			}
		} else {
			// Apenas campos de texto
			updatedUserData = await updateProfileText(
				session?.user?.id,
				profile,
				originalProfile,
				profileImageChanged
			);
		}

		if (updatedUserData) {
			setOriginalProfile({
				name: updatedUserData.name,
				username: updatedUserData.username,
				bio: updatedUserData.bio || "",
			});

			dispatchProfileEvents(updatedUserData);

			if (updatedUserData.username !== session?.user?.username) {
				update({
					user: {
						...session?.user,
						username: updatedUserData.username,
						name: updatedUserData.name,
						image: updatedUserData.image,
					},
				});
			}
		}

		if (newImageUrl) {
			updateOriginalImageUrl(newImageUrl);
			resetImageState();
			dispatchImageUpdateEvent(newImageUrl);
		} else if (profileImageChanged) {
			resetImageState();
		}

		clearValidationErrors();
		dispatchIframeReload();

		setLoading(false);
		animateButtonsOut();
	};

	const handleCancelChanges = () => {
		resetImageState();
		clearValidationErrors();
		animateButtonsOut();
	};

	return {
		loading,
		handleSaveProfile,
		handleCancelChanges,
		debouncedValidateUsername,
	};
};
