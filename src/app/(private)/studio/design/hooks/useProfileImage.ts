import { useCallback, useState } from "react";

export const useProfileImage = (initialImageUrl: string) => {
	const [profilePreview, setProfilePreview] = useState<string>(initialImageUrl);
	const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(
		null
	);
	const [profileImageChanged, setProfileImageChanged] = useState(false);
	const [originalProfileImageUrl, setOriginalProfileImageUrl] =
		useState<string>(initialImageUrl);
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [isImageCropModalOpen, setIsImageCropModalOpen] = useState(false);

	const uploadImage = useCallback(
		async (file: File, userId: string): Promise<string | null> => {
			setIsUploadingImage(true);
			const formData = new FormData();
			formData.append("file", file);
			formData.append("type", "profile");

			try {
				const res = await fetch(`/api/profile/${userId}/upload?type=profile`, {
					method: "POST",
					body: formData,
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Falha no upload");
				}
				return data.url;
			} catch {
				setProfilePreview(originalProfileImageUrl);
				return null;
			} finally {
				setIsUploadingImage(false);
			}
		},
		[originalProfileImageUrl]
	);

	const handleProfileImageSave = useCallback((imageFile: File) => {
		const previewUrl = URL.createObjectURL(imageFile);
		setProfilePreview(previewUrl);
		setSelectedProfileFile(imageFile);
		setProfileImageChanged(true);
	}, []);

	const handleProfileImageRemove = useCallback(() => {
		const defaultImageUrl =
			"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png";
		setProfilePreview(defaultImageUrl);
		setSelectedProfileFile(null);
		setProfileImageChanged(true);
	}, []);

	const resetImageState = useCallback(
		(newImageUrl?: string) => {
			const imageUrl = newImageUrl || originalProfileImageUrl;
			setProfilePreview(`${imageUrl}?t=${Date.now()}`);
			setOriginalProfileImageUrl(imageUrl);
			setSelectedProfileFile(null);
			setProfileImageChanged(false);
		},
		[originalProfileImageUrl]
	);

	const updateOriginalImageUrl = useCallback((newUrl: string) => {
		setOriginalProfileImageUrl(newUrl);
		setProfilePreview(`${newUrl}?t=${Date.now()}`);
	}, []);

	return {
		profilePreview,
		selectedProfileFile,
		profileImageChanged,
		originalProfileImageUrl,
		isUploadingImage,
		isImageCropModalOpen,
		setIsImageCropModalOpen,
		uploadImage,
		handleProfileImageSave,
		handleProfileImageRemove,
		resetImageState,
		updateOriginalImageUrl,
	};
};
