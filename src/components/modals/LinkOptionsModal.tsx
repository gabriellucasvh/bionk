// src/components/LinkOptionsModal.tsx

"use client";

import { ExternalLink, Flag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { UserLink } from "@/types/user-profile";
import { BaseButton } from "../buttons/BaseButton";
import ShareSheet from "../ShareSheet";

interface LinkOptionsModalProps {
	link: UserLink | null;
	onOpenChange: (isOpen: boolean) => void;
	username?: string;
}

const LinkOptionsModal: FC<LinkOptionsModalProps> = ({
	link,
	onOpenChange,
	username,
}) => {
	// Hooks devem ser chamados no topo do componente
	const pathname = usePathname();
	const usernameFromPath = (pathname || "")
		.split("/")
		.filter(Boolean)[0] || "";
	const ownerUsername = username || usernameFromPath || "";
	const reportHref = `/reportar-violacao?ref=linkoptionsmodal&u=${encodeURIComponent(ownerUsername)}`;

	if (!link) {
		return null;
	}

	const handleOpenLink = () => {
		if (link.url) {
			window.open(link.url, "_blank", "noopener,noreferrer");
		}
	};

	return (
		<Dialog onOpenChange={onOpenChange} open={!!link}>
			<DialogContent className="w-full max-w-[90vw] rounded-3xl border bg-background p-6 text-center shadow-xl sm:max-w-lg">
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
						{link.url || "URL não disponível"}
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

					<ShareSheet title={link.title} url={link.url || ""} />

					<Link
						className="mx-auto inline-flex justify-center rounded-xl px-4 py-2 text-red-500 hover:text-red-600"
						href={reportHref}
						prefetch={false}
						rel="noopener noreferrer"
						target="_blank"
					>
						<Flag className="mr-2 size-4" />
						Denunciar Link
					</Link>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default LinkOptionsModal;
