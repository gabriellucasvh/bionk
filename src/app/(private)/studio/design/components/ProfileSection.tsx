import { Edit, Loader2 } from "lucide-react";
import Image from "next/image";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileSectionProps {
	profile: {
		name: string;
		username: string;
		bio: string;
	};
	originalProfile: {
		name: string;
		username: string;
		bio: string;
	};
	profilePreview: string;
	isUploadingImage: boolean;
	loading: boolean;
	validationError: string | null;
	bioValidationError: string | null;
	isCheckingUsername: boolean;
	showButtons: boolean;
	onProfileChange: (field: string, value: string) => void;
	onUsernameChange: (username: string) => void;
	onBioChange: (bio: string) => void;
	onImageEditClick: () => void;
	onSaveProfile: () => void;
	onCancelChanges: () => void;
}

const ProfileSection = ({
	profilePreview,
	isUploadingImage,
	onImageEditClick,
}: ProfileSectionProps) => {
	return (
		<section>
			<h2 className="mb-4 font-bold text-lg md:text-2xl lg:block dark:text-white">
				Header
			</h2>
			<Card className="border-none p-5 shadow-none dark:bg-zinc-900">
				<CardContent className="space-y-6 px-0">
					<article className="flex flex-col gap-4 sm:flex-row sm:items-center">
						<div className="relative flex items-center justify-center">
							<div
								className={`h-24 w-24 overflow-hidden rounded-full bg-muted shadow-black/20 shadow-md ${
									isUploadingImage ? "opacity-50" : ""
								}`}
							>
								<Image
									alt="Foto de perfil"
									className="h-full w-full object-cover"
									height={96}
									key={profilePreview}
									src={profilePreview}
									width={96}
								/>
								{isUploadingImage && (
									<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50">
										<Loader2 className="h-6 w-6 animate-spin text-white" />
									</div>
								)}
							</div>
							<BaseButton
								className="absolute right-0 bottom-0 rounded-full"
								disabled={isUploadingImage}
								onClick={onImageEditClick}
								size="icon"
								variant="white"
							>
								<Edit className="h-4 w-4" />
							</BaseButton>
						</div>
					</article>
				</CardContent>
			</Card>
		</section>
	);
};

export default ProfileSection;
