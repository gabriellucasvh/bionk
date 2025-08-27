// src/components/LinkOptionsModal.tsx

"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { UserLink } from "@/types/user-profile";
import { ExternalLink, Flag } from "lucide-react";
import Image from "next/image";
import type { FC } from "react";
import { BaseButton } from "./buttons/BaseButton";
import ShareSheet from "./ShareSheet";

interface LinkOptionsModalProps {
	link: UserLink | null;
	onOpenChange: (isOpen: boolean) => void;
}

const LinkOptionsModal: FC<LinkOptionsModalProps> = ({
	link,
	onOpenChange,
}) => {
	if (!link) {
		return null;
	}

	const handleOpenLink = () => {
		window.open(link.url, "_blank", "noopener,noreferrer");
	};

	return (
		<Dialog onOpenChange={onOpenChange} open={!!link}>
			<DialogContent className="w-full max-w-[90vw] rounded-2xl border bg-background p-6 text-center shadow-xl sm:max-w-lg">
				<div className="flex justify-center pb-2">
					<Image
						alt="Bionk Logo"
						className="mx-auto h-auto w-20"
						height={40}
						src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755641260/bionk-logo_sehkbi.svg"
						width={80}
					/>
				</div>

				<DialogHeader className="text-center">
					<DialogTitle className="mb-2 line-clamp-2 font-bold text-gray-900 text-xl">
						{link.title}
					</DialogTitle>
					<DialogDescription className="mb-4 line-clamp-2 max-w-md truncate text-gray-600 text-sm">
						{link.url}
					</DialogDescription>
				</DialogHeader>

				<div className="flex min-w-0 flex-col gap-4">
					<BaseButton
						className="justify-center"
						fullWidth
						onClick={handleOpenLink}
						variant="default"
					>
						<ExternalLink className="mr-2 size-4" />
						Abrir Link
					</BaseButton>

					<ShareSheet title={link.title} url={link.url} />

					<BaseButton
						className="justify-center text-red-500 hover:bg-red-50 hover:text-red-600"
						fullWidth
						variant="white"
					>
						<Flag className="mr-2 size-4" />
						Denunciar Link
					</BaseButton>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default LinkOptionsModal;
