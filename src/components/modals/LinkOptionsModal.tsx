// src/components/LinkOptionsModal.tsx

"use client";

import { ExternalLink, Flag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC } from "react";
import {
	Dialog,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DialogBottomSheetContent } from "@/components/ui/dialog-bottom-sheet";
import type { UserLink } from "@/types/user-profile";
import { BaseButton } from "../buttons/BaseButton";
import ShareSheet from "../ShareSheet";

const formatUrlForDisplay = (raw?: string) => {
	const src = (raw || "").trim();
	if (!src) {
		return "URL não disponível";
	}
	let normalized = src;
	const lower = src.toLowerCase();
	if (!(lower.startsWith("http://") || lower.startsWith("https://"))) {
		normalized = `https://${src}`;
	}
	try {
		const u = new URL(normalized);
		const host = u.hostname;
		let clean = u.pathname || "";
		while (clean.startsWith("/")) {
			clean = clean.slice(1);
		}
		if (!clean) {
			return host;
		}
		const snippet = clean.slice(0, 4);
		return `${host}/${snippet}${clean.length > 4 ? "..." : ""}`;
	} catch {
		const schemeIndex = src.indexOf("://");
		const withoutScheme = schemeIndex >= 0 ? src.slice(schemeIndex + 3) : src;
		const firstSlash = withoutScheme.indexOf("/");
		const host =
			firstSlash >= 0 ? withoutScheme.slice(0, firstSlash) : withoutScheme;
		const rest = firstSlash >= 0 ? withoutScheme.slice(firstSlash + 1) : "";
		if (!rest) {
			return host || "URL não disponível";
		}
		const snippet = rest.slice(0, 4);
		return `${host}/${snippet}${rest.length > 4 ? "..." : ""}`;
	}
};

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
	const usernameFromPath = (pathname || "").split("/").filter(Boolean)[0] || "";
	const ownerUsername = username || usernameFromPath || "";
	const reportHref = `/reportar-violacao?ref=linkoptionsmodal&u=${encodeURIComponent(ownerUsername)}`;

	if (!link) {
		return null;
	}

	const displayUrl = formatUrlForDisplay(link.url);

	const handleOpenLink = () => {
		if (link.url) {
			window.open(link.url, "_blank", "noopener,noreferrer");
		}
	};

	return (
		<Dialog onOpenChange={onOpenChange} open={!!link}>
			<DialogBottomSheetContent className="text-center">
				<div className="flex justify-center pb-2">
					<Image
						alt="Bionk Logo"
						className="mx-auto h-auto w-20"
						height={40}
						src="/images/bionk-name-logo.svg"
						width={80}
					/>
				</div>

				<DialogHeader className="text-center">
					<DialogTitle className="mb-2 line-clamp-2 font-bold text-gray-900 text-xl">
						{link.title}
					</DialogTitle>
					<DialogDescription className="mb-4 line-clamp-2 max-w-md truncate text-gray-600 text-sm">
						{displayUrl}
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
						className="mx-auto flex items-center justify-center rounded-xl px-4 py-2 text-red-500 hover:text-red-600"
						href={reportHref}
						prefetch={false}
						rel="noopener noreferrer"
						target="_blank"
					>
						<Flag className="mr-2 size-4" />
						Denunciar Link
					</Link>
				</div>
			</DialogBottomSheetContent>
		</Dialog>
	);
};

export default LinkOptionsModal;
