import { useEffect, useState } from "react";

type UserCustomizations = {
	customBackgroundColor: string;
	customBackgroundGradient: string;
	customTextColor: string;
	customFont: string;
	customButtonColor: string;
	customButtonTextColor: string;
	customButtonStyle: string;
	customButtonFill: string;
	customButtonCorners: string;
	headerStyle: string;
};

const defaultCustomizations: UserCustomizations = {
	customBackgroundColor: "",
	customBackgroundGradient: "",
	customTextColor: "",
	customFont: "",
	customButtonColor: "",
	customButtonTextColor: "",
	customButtonStyle: "solid",
	customButtonFill: "",
	customButtonCorners: "",
	headerStyle: "default",
};

export const useCustomizations = () => {
	const [userCustomizations, setUserCustomizations] =
		useState<UserCustomizations>(defaultCustomizations);

	useEffect(() => {
		const fetchCustomizations = async () => {
			const response = await fetch("/api/user-customizations");
			const data = await response.json();
			if (data) {
				setUserCustomizations(data);
			}
		};
		fetchCustomizations();
	}, []);

	const handleTemplateChange = () => {
		setUserCustomizations(defaultCustomizations);
		window.dispatchEvent(new CustomEvent("reloadIframePreview"));
	};

	const handleSaveCustomizations = async (
		partialCustomizations: Partial<UserCustomizations>
	) => {
		const response = await fetch("/api/update-customizations", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(partialCustomizations),
		});

		if (response.ok) {
			setUserCustomizations((prev) => ({
				...prev,
				...partialCustomizations,
			}));

			window.dispatchEvent(new CustomEvent("reloadIframePreview"));
		}
	};

	return {
		userCustomizations,
		handleTemplateChange,
		handleSaveCustomizations,
	};
};