// src/components/ShareModal.tsx (Corrigido)

"use client";
import { BaseButton } from "@/components/buttons/BaseButton";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"; 
import type { TemplateComponentProps } from "@/types/user-profile";
import { Check, Copy, Facebook, Send, Twitter } from "lucide-react";
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
	const [copied, setCopied] = useState(false);
	const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

	const profileUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://bionk.me"}/${user.username}`;
	const shareText = "Confira meu perfil na Bionk:";

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

	const handleCopyLink = () => {
		navigator.clipboard.writeText(profileUrl).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	};

	const socialShareLinks = {
		whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${profileUrl}`)}`,
		twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(shareText)}`,
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
		telegram: `https://t.me/share/url?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(shareText)}`,
	};

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

				<div className="mt-4 flex flex-col gap-4">
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

					<div className="flex items-center justify-center gap-4 py-2">
						<Link
							className="rounded-full bg-green-500 p-3 text-white transition-opacity hover:opacity-90"
							href={socialShareLinks.whatsapp}
							rel="noopener noreferrer"
							target="_blank"
						>
							<Send className="size-5" />
						</Link>
						<Link
							className="rounded-full bg-sky-500 p-3 text-white transition-opacity hover:opacity-90"
							href={socialShareLinks.twitter}
							rel="noopener noreferrer"
							target="_blank"
						>
							<Twitter className="size-5" />
						</Link>
						<Link
							className="rounded-full bg-blue-700 p-3 text-white transition-opacity hover:opacity-90"
							href={socialShareLinks.facebook}
							rel="noopener noreferrer"
							target="_blank"
						>
							<Facebook className="size-5" />
						</Link>
						<Link
							className="rounded-full bg-sky-600 p-3 text-white transition-opacity hover:opacity-90"
							href={socialShareLinks.telegram}
							rel="noopener noreferrer"
							target="_blank"
						>
							<Send className="size-5" />
						</Link>
					</div>

					<div className="flex w-full items-center rounded-lg border bg-white p-1">
						{/* ... (input de copiar link sem alteração) ... */}
						<input
							className="flex-grow truncate bg-transparent px-3 text-black text-sm focus:outline-none"
							readOnly
							type="text"
							value={profileUrl}
						/>
						<button
							className={`flex items-center gap-2 rounded-md px-3 py-2 font-semibold text-sm transition-all duration-200 ${copied ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}
							onClick={handleCopyLink}
							type="button"
						>
							{copied ? (
								<Check className="size-4" />
							) : (
								<Copy className="size-4" />
							)}
							{copied ? "Copiado!" : "Copiar"}
						</button>
					</div>

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
