import { useCallback, useEffect, useState } from "react";

interface ProfileState {
	name: string;
	username: string;
	bio: string;
}

export const useButtonAnimations = (
	profile: ProfileState,
	originalProfile: ProfileState,
	profileImageChanged: boolean
) => {
	const [showButtons, setShowButtons] = useState(false);
	const [isExiting, setIsExiting] = useState(false);

	const hasTextChanges = useCallback(() => {
		return (
			profile.name !== originalProfile.name ||
			profile.username !== originalProfile.username ||
			profile.bio !== originalProfile.bio
		);
	}, [profile, originalProfile]);

	const hasAnyChanges = useCallback(() => {
		return hasTextChanges() || profileImageChanged;
	}, [hasTextChanges, profileImageChanged]);

	const animateButtonsOut = useCallback((callback?: () => void) => {
		setIsExiting(true);
		setTimeout(() => {
			setShowButtons(false);
			setIsExiting(false);
			callback?.();
		}, 300);
	}, []);

	useEffect(() => {
		const hasChanges = hasAnyChanges();

		if (hasChanges && !showButtons) {
			setShowButtons(true);
			setIsExiting(false);
		} else if (!hasChanges && showButtons) {
			animateButtonsOut();
		}
	}, [hasAnyChanges, showButtons, animateButtonsOut]);

	return {
		showButtons,
		isExiting,
		hasTextChanges,
		hasAnyChanges,
		animateButtonsOut,
	};
};
