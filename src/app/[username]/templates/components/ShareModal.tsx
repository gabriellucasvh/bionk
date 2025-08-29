// src/app/[username]/templates/components/ShareModal.tsx

"use client";

import { BaseButton } from "@/components/buttons/BaseButton";
import ShareSheet from "@/components/ShareSheet";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { TemplateComponentProps } from "@/types/user-profile";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";
import { QRCode } from "react-qrcode-logo";

interface ShareModalProps {
	user: TemplateComponentProps["user"];
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
}

const ShareModal: FC<ShareModalProps> = ({ user, isOpen, onOpenChange }) => {
	const { data: session } = useSession();
	const username = session?.user?.username;
	const profileUrl = `${
		process.env.NEXT_PUBLIC_BASE_URL || "https://bionk.me"
	}/${user.username}`;
	const shareText = `Confira meu perfil na Bionk: ${user.username || user.name}`;
	const logoUrl = "/bionk-logo-quadrado-pb.svg";

	return (
		<Dialog onOpenChange={onOpenChange} open={isOpen}>
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

				<DialogHeader>
					<DialogTitle className="text-center font-bold text-2xl text-black">
						Compartilhar Perfil
					</DialogTitle>
					<DialogDescription className="pt-2 text-center text-muted-foreground text-sm">
						Divulgue seu perfil Bionk usando link, QR code ou redes sociais.
					</DialogDescription>
				</DialogHeader>

				<div className="flex min-w-0 flex-col gap-4">
					{isOpen && user.username && (
						<div className="flex flex-col items-center justify-center rounded-lg bg-gray-100 p-2">
							<QRCode
								logoImage={logoUrl}
								logoPadding={5}
								logoWidth={30}
								qrStyle="dots"
								size={192}
								value={profileUrl}
							/>
							<span className="mt-px break-all text-xs">
								bionk.me/{username}
							</span>
						</div>
					)}

					<ShareSheet title={shareText} url={profileUrl} />

					<div className="mt-4 flex w-full flex-col gap-3">
						<BaseButton asChild className="w-full">
							<Link href="/registro" rel="noopener noreferrer" target="_blank">
								Criar sua conta Bionk
							</Link>
						</BaseButton>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ShareModal;
