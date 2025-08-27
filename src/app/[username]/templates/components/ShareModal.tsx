// src/app/[username]/templates/components/ShareModal.tsx

"use client";
import { BaseButton } from "@/components/buttons/BaseButton";
import ShareSheet from "@/components/ShareSheet"; // Importe o novo componente
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { TemplateComponentProps } from "@/types/user-profile";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { type FC, useEffect, useState } from "react";

interface ShareModalProps {
	user: TemplateComponentProps["user"];
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
}

const ShareModal: FC<ShareModalProps> = ({ user, isOpen, onOpenChange }) => {
	const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

	const profileUrl = `${
		process.env.NEXT_PUBLIC_BASE_URL || "https://bionk.me"
	}/${user.username}`;
	const shareText = `Confira meu perfil na Bionk: ${user.name || user.username}`;

	useEffect(() => {
		if (!(isOpen && user.username)) {
			return;
		}

		QRCode.toDataURL(profileUrl, {
			width: 240,
			margin: 2,
			color: {
				dark: "#000000",
				light: "#ffffff",
			},
		}).then(setQrCodeUrl);
	}, [isOpen, profileUrl, user.username]);

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
						Compartilhe seu perfil Bionk com o mundo através de um link, QR code
						ou redes sociais.
					</DialogDescription>
				</DialogHeader>

				<div className="mt-4 flex min-w-0 flex-col gap-4">
					{qrCodeUrl && (
						<div className="flex justify-center rounded-lg bg-gray-100 p-2">
							<Image
								alt="QR Code do perfil"
								className="h-48 w-48 rounded-md"
								height={192}
								src={qrCodeUrl}
								width={192}
							/>
						</div>
					)}

					<ShareSheet title={shareText} url={profileUrl} />

					<div className="mt-4 flex w-full flex-col gap-3">
						<BaseButton asChild className="w-full">
							<Link href="/registro" rel="noopener noreferrer" target="_blank">
								Criar o seu Bionk
							</Link>
						</BaseButton>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ShareModal;
