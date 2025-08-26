// src/components/LinkOptionsModal.tsx

"use client";

import type { UserLink } from "@/types/user-profile";
import {
	Check,
	ExternalLink,
	Facebook,
	Flag,
	Linkedin,
	Link as LinkIcon,
	Share2,
	Twitter,
	User2,
	X,
} from "lucide-react";
import { type FC, useState } from "react";
import { BaseButton } from "./buttons/BaseButton";

interface LinkOptionsModalProps {
	link?: UserLink;
	onClose: () => void;
	isOpen: boolean;
}

const LinkOptionsModal: FC<LinkOptionsModalProps> = ({
	link,
	onClose,
	isOpen,
}) => {
	const [_copied, setCopied] = useState(false);
	const [activeShare, setActiveShare] = useState<string | null>(null);

	if (!(isOpen && link)) {
		return null;
	}

	const handleCopyLink = () => {
		navigator.clipboard.writeText(link.url).then(() => {
			setCopied(true);
			setActiveShare("copy");
			setTimeout(() => {
				setCopied(false);
				setActiveShare(null);
			}, 2000);
		});
	};

	const handleNativeShare = () => {
		if (navigator.share) {
			navigator.share({
				title: link.title,
				url: link.url,
			});
		} else {
			handleCopyLink();
		}
	};

	const handleSocialShare = (platform: string) => {
		setActiveShare(platform);
		setTimeout(() => setActiveShare(null), 1000);

		const encodedUrl = encodeURIComponent(link.url);
		const encodedTitle = encodeURIComponent(link.title);

		let shareUrl = "";

		switch (platform) {
			case "twitter":
				shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
				break;
			case "facebook":
				shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
				break;
			case "linkedin":
				shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
				break;
			case "whatsapp":
				shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
				break;
			default:
				return;
		}

		// abre sempre em uma nova guia sem popup
		window.open(shareUrl, "_blank", "noopener,noreferrer");
	};

	const handleOpenLink = () => {
		window.open(link.url, "_blank", "noopener,noreferrer");
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
			onClick={onClose}
			role="none"
		>
			<div
				className="fade-in-90 zoom-in-90 relative w-full max-w-md animate-in rounded-2xl bg-white p-6 text-center shadow-xl"
				onClick={(e) => e.stopPropagation()}
				role="none"
			>
				<button
					aria-label="Fechar modal"
					className="absolute top-4 right-4 rounded-full bg-gray-100 p-1.5 text-gray-500 transition-colors hover:bg-gray-200 hover:text-lime-600"
					onClick={onClose}
					type="button"
				>
					<X className="size-5" />
				</button>

				<div className="mb-5">
					<h2
						className="mb-2 line-clamp-2 px-6 font-bold text-gray-900 text-xl"
						id="modal-title"
					>
						{link.title}
					</h2>
					<p className="mb-4 line-clamp-2 break-words text-gray-600 text-sm">
						{link.url}
					</p>
				</div>

				<div className="mb-5 flex flex-col gap-3">
					<BaseButton
						className="justify-center"
						fullWidth
						onClick={handleOpenLink}
						variant="default"
					>
						<ExternalLink className="mr-2 size-4" />
						Abrir Link
					</BaseButton>
				</div>

				<div className="mb-5">
					<h3 className="mb-3 font-medium text-gray-700 text-sm">
						Compartilhar em
					</h3>
					<div className="grid grid-cols-4 gap-2">
						<button
							aria-label="Compartilhar no Twitter"
							className={`flex flex-col items-center justify-center rounded-xl p-3 transition-all ${
								activeShare === "twitter"
									? "scale-95 bg-blue-50 text-blue-500"
									: "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-500"
							}`}
							onClick={() => handleSocialShare("twitter")}
							type="button"
						>
							<Twitter className="mb-1 size-5" />
							<span className="text-xs">Twitter</span>
						</button>

						<button
							aria-label="Compartilhar no Facebook"
							className={`flex flex-col items-center justify-center rounded-xl p-3 transition-all ${
								activeShare === "facebook"
									? "scale-95 bg-blue-50 text-blue-600"
									: "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
							}`}
							onClick={() => handleSocialShare("facebook")}
							type="button"
						>
							<Facebook className="mb-1 size-5" />
							<span className="text-xs">Facebook</span>
						</button>

						<button
							aria-label="Compartilhar no LinkedIn"
							className={`flex flex-col items-center justify-center rounded-xl p-3 transition-all ${
								activeShare === "linkedin"
									? "scale-95 bg-blue-50 text-blue-700"
									: "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
							}`}
							onClick={() => handleSocialShare("linkedin")}
							type="button"
						>
							<Linkedin className="mb-1 size-5" />
							<span className="text-xs">LinkedIn</span>
						</button>

						<button
							aria-label="Compartilhar no WhatsApp"
							className={`flex flex-col items-center justify-center rounded-xl p-3 transition-all ${
								activeShare === "whatsapp"
									? "scale-95 bg-green-50 text-green-600"
									: "bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-600"
							}`}
							onClick={() => handleSocialShare("whatsapp")}
							type="button"
						>
							<User2 className="mb-1 size-5" />
							<span className="text-xs">WhatsApp</span>
						</button>
					</div>
				</div>

				<div className="flex flex-col gap-3">
					<BaseButton
						className="justify-center"
						fullWidth
						onClick={handleNativeShare}
						variant="white"
					>
						<Share2 className="mr-2 size-4" />
						Compartilhar via...
					</BaseButton>

					<BaseButton
						className="justify-center"
						fullWidth
						onClick={handleCopyLink}
						variant="white"
					>
						{activeShare === "copy" ? (
							<Check className="mr-2 size-4 text-green-500" />
						) : (
							<LinkIcon className="mr-2 size-4" />
						)}
						{activeShare === "copy" ? "Link Copiado!" : "Copiar Link"}
					</BaseButton>

					<BaseButton
						className="justify-center text-red-500 hover:bg-red-50 hover:text-red-600"
						fullWidth
						variant="white"
					>
						<Flag className="mr-2 size-4" />
						Denunciar Link
					</BaseButton>
				</div>
			</div>
		</div>
	);
};

export default LinkOptionsModal;
