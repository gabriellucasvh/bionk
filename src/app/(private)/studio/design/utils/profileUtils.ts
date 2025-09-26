interface User {
	name: string;
	username: string;
	bio?: string;
	image?: string;
}

export const dispatchProfileEvents = (updatedUserData: User) => {
	window.dispatchEvent(
		new CustomEvent("profileNameUpdated", {
			detail: { name: updatedUserData.name },
		})
	);

	window.dispatchEvent(
		new CustomEvent("profileUsernameUpdated", {
			detail: { username: updatedUserData.username },
		})
	);

	if (updatedUserData.image) {
		window.dispatchEvent(
			new CustomEvent("profileImageUpdated", {
				detail: { imageUrl: updatedUserData.image },
			})
		);
	}
};

export const dispatchImageUpdateEvent = (imageUrl: string) => {
	window.dispatchEvent(
		new CustomEvent("profileImageUpdated", {
			detail: { imageUrl },
		})
	);
};

export const dispatchIframeReload = () => {
	window.dispatchEvent(new CustomEvent("reloadIframePreview"));
};

export const sanitizeUsername = (username: string): string => {
	return username.replace(/[^a-zA-Z0-9_.]/g, "").toLowerCase();
};
