import { Edit, Loader2 } from "lucide-react";
import Image from "next/image";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sanitizeUsername } from "../utils/profileUtils";

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
	profile,
	originalProfile,
	profilePreview,
	isUploadingImage,
	loading,
	validationError,
	bioValidationError,
	isCheckingUsername,
	showButtons,
	onProfileChange,
	onUsernameChange,
	onBioChange,
	onImageEditClick,
	onSaveProfile,
	onCancelChanges,
}: ProfileSectionProps) => {
	const handleUsernameChange = (value: string) => {
		const sanitizedUsername = sanitizeUsername(value);
		onProfileChange("username", sanitizedUsername);
		onUsernameChange(sanitizedUsername);
	};

	const handleBioChange = (value: string) => {
		onProfileChange("bio", value);
		onBioChange(value);
	};

	const renderUsernameValidation = () => {
		if (isCheckingUsername) {
			return (
				<div className="flex items-center gap-1 text-blue-500 text-sm">
					<Loader2 className="h-3 w-3 animate-spin" />
					<span>Verificando disponibilidade...</span>
				</div>
			);
		}

		if (validationError) {
			return <p className="text-red-500 text-sm">{validationError}</p>;
		}

		if (profile.username && profile.username !== originalProfile.username) {
			return <p className="text-green-500 text-sm">✓ Username disponível</p>;
		}

		return null;
	};

	const getBioCharacterCountColor = () => {
		if (profile.bio.length > 270) {
			return "text-orange-500";
		}
		if (profile.bio.length > 240) {
			return "text-yellow-500";
		}
		return "text-gray-500 dark:text-gray-400";
	};

	return (
		<section>
			<h2 className="mb-4 font-bold text-lg md:text-2xl lg:block dark:text-white">
				Header
			</h2>
			<Card className="border-none py-0 shadow-none dark:bg-neutral-800">
				<CardContent className="space-y-6 px-0">
					<article className="flex flex-col gap-4 sm:flex-row sm:items-center">
						<div className="relative flex items-center justify-center">
							<div
								className={`h-26 w-26 overflow-hidden rounded-full bg-muted shadow-black/20 shadow-md ${
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
						<div className="flex-1 space-y-4">
							<div className="grid gap-1">
								<Label className="dark:text-white" htmlFor="name">
									Nome
								</Label>
								<Input
									className="text-neutral-700 dark:bg-neutral-700 dark:text-white"
									disabled={loading || isUploadingImage}
									id="name"
									maxLength={44}
									onChange={(e) => onProfileChange("name", e.target.value)}
									placeholder="Seu nome de exibição"
									value={profile.name}
								/>
							</div>
							<div className="grid gap-1">
								<Label className="dark:text-white" htmlFor="username">
									Nome de usuário
								</Label>
								<div className="flex items-center gap-2">
									<span className="text-muted-foreground dark:text-gray-400">
										bionk.me/
									</span>
									<Input
										className={
											validationError
												? "border-red-500 dark:border-red-400"
												: "text-neutral-700 dark:bg-neutral-700 dark:text-white"
										}
										disabled={loading || isUploadingImage}
										id="username"
										maxLength={30}
										onChange={(e) => handleUsernameChange(e.target.value)}
										placeholder="username"
										value={profile.username}
									/>
								</div>
								<div className="flex min-h-[1.25rem] items-center gap-2">
									{renderUsernameValidation()}
								</div>
							</div>
						</div>
					</article>
					<div className="grid gap-2">
						<Label className="dark:text-white" htmlFor="bio">
							Biografia
						</Label>
						<Textarea
							className={`min-h-32 ${
								bioValidationError
									? "border-red-500 dark:border-red-400"
									: "text-neutral-700 dark:bg-neutral-700 dark:text-white"
							}`}
							disabled={loading || isUploadingImage}
							id="bio"
							maxLength={150}
							onChange={(e) => handleBioChange(e.target.value)}
							placeholder="Fale um pouco sobre você"
							value={profile.bio}
						/>
						<div className="flex min-h-[1.25rem] items-center justify-between">
							<p className="text-red-500 text-sm">
								{bioValidationError || " "}
							</p>
							<p className={`text-sm ${getBioCharacterCountColor()}`}>
								{profile.bio.length}/150
							</p>
						</div>
					</div>
					<div className="flex h-10 items-start justify-start gap-2">
						{showButtons && (
							<>
								<BaseButton
									disabled={loading || isUploadingImage}
									onClick={onCancelChanges}
									size="sm"
									variant="white"
								>
									Cancelar
								</BaseButton>
								<BaseButton
									className="px-6"
									disabled={
										loading ||
										isUploadingImage ||
										!!validationError ||
										!!bioValidationError ||
										isCheckingUsername
									}
									loading={loading || isUploadingImage}
									onClick={onSaveProfile}
									size="sm"
								>
									Salvar
								</BaseButton>
							</>
						)}
					</div>
				</CardContent>
			</Card>
		</section>
	);
};

export default ProfileSection;
