// src/app/(private)/studio/design/design.client.tsx
"use client";

import { useSession } from "next-auth/react";
import LoadingPage from "@/components/layout/LoadingPage";
import ProfileImageCropModal from "@/components/modals/ProfileImageCropModal";
import CategoriasTemplates from "./components/design.CategoriasTemplates";
import DesignPanel from "./components/design.Panel";
import ProfileSection from "./components/ProfileSection";
import { useButtonAnimations } from "./hooks/useButtonAnimations";
import { useCustomizations } from "./hooks/useCustomizations";
import { useProfileData } from "./hooks/useProfileData";
import { useProfileImage } from "./hooks/useProfileImage";
import { useProfileValidation } from "./hooks/useProfileValidation";
import { useSaveProfile } from "./hooks/useSaveProfile";

const PersonalizarClient = () => {
	const { data: session } = useSession();

	const {
		profile,
		setProfile,
		originalProfile,
		setOriginalProfile,
		userData,
		isProfileLoading,
		updateProfileText,
	} = useProfileData(session?.user?.id || undefined, session?.user?.image || undefined);

	const {
		profilePreview,
		selectedProfileFile,
		profileImageChanged,
		isUploadingImage,
		isImageCropModalOpen,
		setIsImageCropModalOpen,
		uploadImage,
		handleProfileImageSave,
		handleProfileImageRemove,
		resetImageState,
		updateOriginalImageUrl,
	} = useProfileImage(
		session?.user?.image ||
			"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png"
	);

	const {
		validationError,
		bioValidationError,
		isCheckingUsername,
		validateBio,
		validateUsername,
		clearValidationErrors,
	} = useProfileValidation();

	const { showButtons, animateButtonsOut } = useButtonAnimations(
		profile,
		originalProfile,
		profileImageChanged
	);

	const { userCustomizations, handleTemplateChange, handleSaveCustomizations } =
		useCustomizations();

	const {
		loading,
		handleSaveProfile,
		handleCancelChanges,
		debouncedValidateUsername,
	} = useSaveProfile({
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
	});

	const handleProfileChange = (field: string, value: string) => {
		setProfile({ ...profile, [field]: value });
	};

	const handleProfileCancel = () => {
		setProfile({ ...originalProfile });
		handleCancelChanges();
	};

	if (isProfileLoading) {
		return <LoadingPage />;
	}

	return (
		<div className="min-h-screen w-full bg-white text-black transition-colors md:w-11/12 xl:w-7/12 dark:bg-neutral-800 dark:text-white">
			<section className="flex min-h-screen flex-col gap-6 px-6 py-8 pb-24">
				<ProfileSection
					bioValidationError={bioValidationError}
					isCheckingUsername={isCheckingUsername}
					isUploadingImage={isUploadingImage}
					loading={loading}
					onBioChange={validateBio}
					onCancelChanges={handleProfileCancel}
					onImageEditClick={() => setIsImageCropModalOpen(true)}
					onProfileChange={handleProfileChange}
					onSaveProfile={handleSaveProfile}
					onUsernameChange={debouncedValidateUsername}
					originalProfile={originalProfile}
					profile={profile}
					profilePreview={profilePreview}
					showButtons={showButtons}
					validationError={validationError}
				/>

				<section className="border-t pt-6 dark:border-gray-700">
					<h2 className="mb-4 font-bold text-lg md:text-2xl lg:block dark:text-white">
						Templates
					</h2>
					<CategoriasTemplates onTemplateChange={handleTemplateChange} />
				</section>

				<section className="border-t pt-6 dark:border-gray-700">
					<h2 className="mb-4 font-bold text-lg md:text-2xl lg:block dark:text-white">
						Personalização
					</h2>
					<DesignPanel
						onSave={handleSaveCustomizations}
						userCustomizations={userCustomizations}
						userData={userData}
					/>
				</section>
			</section>

			<ProfileImageCropModal
				currentImageUrl={profilePreview}
				isOpen={isImageCropModalOpen}
				onClose={() => setIsImageCropModalOpen(false)}
				onImageRemove={handleProfileImageRemove}
				onImageSave={handleProfileImageSave}
			/>
		</div>
	);
};

export default PersonalizarClient;
