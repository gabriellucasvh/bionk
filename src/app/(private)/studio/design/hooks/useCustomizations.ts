import { useEffect, useState } from "react";
import { useDesignStore } from "@/stores/designStore";

type UserCustomizations = {
  customBackgroundColor: string;
  customBackgroundGradient: string;
  customBackgroundMediaType: string;
  customBackgroundImageUrl: string;
  customBackgroundVideoUrl: string;
  customTextColor: string;
  customFont: string;
  customButtonColor: string;
  customButtonTextColor: string;
  customButtonStyle: string;
  customButtonFill: string;
  customButtonCorners: string;
  headerStyle: string;
  customBlurredBackground: boolean;
};

const defaultCustomizations: UserCustomizations = {
  customBackgroundColor: "",
  customBackgroundGradient: "",
  customBackgroundMediaType: "",
  customBackgroundImageUrl: "",
  customBackgroundVideoUrl: "",
  customTextColor: "",
  customFont: "",
  customButtonColor: "",
  customButtonTextColor: "",
  customButtonStyle: "",
  customButtonFill: "",
  customButtonCorners: "",
  headerStyle: "default",
  customBlurredBackground: true,
};

export const useCustomizations = () => {
	const [userCustomizations, setUserCustomizations] =
		useState<UserCustomizations>(defaultCustomizations);
	const { setCustomizations } = useDesignStore();

	useEffect(() => {
		const fetchCustomizations = async () => {
			const response = await fetch("/api/user-customizations");
			const data = await response.json();
			if (data) {
				const customizations = {
					...defaultCustomizations,
					...data,
				};
				setUserCustomizations(customizations);
				setCustomizations(customizations);
			}
		};
		fetchCustomizations();
	}, [setCustomizations]);

	const handleTemplateChange = async () => {
		try {
			const response = await fetch("/api/user-customizations");
			const data = await response.json();
			if (data) {
				const updatedCustomizations = {
					...defaultCustomizations,
					...data,
				};
				setUserCustomizations(updatedCustomizations);
				setCustomizations(updatedCustomizations);
			}
		} catch {
			setUserCustomizations(defaultCustomizations);
			setCustomizations(defaultCustomizations);
		}
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
