"use client";
import { Check, Copy, Facebook, Send, Twitter, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { type FC, useEffect, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import type { TemplateComponentProps } from "@/types/user-profile";

interface ShareModalProps {
	user: TemplateComponentProps["user"];
	onClose: () => void;
}

const ShareModal: FC<ShareModalProps> = ({ user, onClose }) => {
	const [copied, setCopied] = useState(false);
	const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

	const profileUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://bionk.me"}/${user.username}`;
	const shareText = "Confira meu perfil na Bionk:";

	useEffect(() => {
		if (!user.username) return;

		QRCode.toDataURL(profileUrl, {
			width: 240,
			margin: 2,
			color: {
				dark: "#000000",
				light: "#ffffff",
			},
		}).then(setQrCodeUrl);
	}, [profileUrl, user.username]);

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
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
			onClick={onClose}
			role="none"
		>
			<div
				className="relative max-w-sm w-full bg-white  rounded-2xl shadow-xl p-6 m-4 flex flex-col gap-4 text-center"
				onClick={(e) => e.stopPropagation()}
				role="none"
			>
				<button
					type="button"
					onClick={onClose}
					className="absolute top-3 right-3 p-1 rounded-full text-black hover:text-lime-500 bg-gray-100 transition-colors"
					aria-label="Fechar modal"
				>
					<X className="size-5" />
				</button>

				<h2 className="text-2xl font-bold text-black">
					Compartilhar Perfil Bionk
				</h2>

				{qrCodeUrl && (
					<div className="flex justify-center bg-gray-100 rounded-lg">
						<Image
							src={qrCodeUrl}
							alt="QR Code do perfil"
							className="w-60 h-60 mx-auto rounded-md border"
							width={70}
							height={70}
						/>
					</div>
				)}

				<div className="flex justify-center items-center gap-4 py-2">
					<Link
						href={socialShareLinks.whatsapp}
						target="_blank"
						rel="noopener noreferrer"
						className="p-3 bg-green-500 text-white rounded-full hover:opacity-90 transition-opacity"
					>
						<Send className="size-5" />
					</Link>
					<Link
						href={socialShareLinks.twitter}
						target="_blank"
						rel="noopener noreferrer"
						className="p-3 bg-sky-500 text-white rounded-full hover:opacity-90 transition-opacity"
					>
						<Twitter className="size-5" />
					</Link>
					<Link
						href={socialShareLinks.facebook}
						target="_blank"
						rel="noopener noreferrer"
						className="p-3 bg-blue-700 text-white rounded-full hover:opacity-90 transition-opacity"
					>
						<Facebook className="size-5" />
					</Link>
					<Link
						href={socialShareLinks.telegram}
						target="_blank"
						rel="noopener noreferrer"
						className="p-3 bg-sky-600 text-white rounded-full hover:opacity-90 transition-opacity"
					>
						<Send className="size-5" />
					</Link>
				</div>

				<div className="flex items-center w-full bg-white border rounded-lg p-1">
					<input
						type="text"
						readOnly
						value={profileUrl}
						className="flex-grow bg-transparent text-sm text-black px-3 truncate focus:outline-none"
					/>
					<button
						type="button"
						onClick={handleCopyLink}
						className={`flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-md transition-all duration-200 ${
							copied
								? "bg-green-100 text-green-700"
								: "bg-gray-100 text-gray-800 hover:bg-gray-200"
						}`}
					>
						{copied ? (
							<Check className="size-4" />
						) : (
							<Copy className="size-4" />
						)}
						{copied ? "Copiado!" : "Copiar"}
					</button>
				</div>
				<p className="text-sm font-light text-start text-black mt-1">
					O único link na bio que une tudo o que importa — usado por criadores,
					marcas e profissionais que querem ir além.
				</p>

				<div className="flex flex-col w-full gap-3 mt-4">
					<BaseButton asChild className="w-full">
						<Link href="/registro" rel="noopener noreferrer" target="_blank">
							Criar o seu Bionk
						</Link>
					</BaseButton>
					<BaseButton variant="white" className="w-full">
						<Link href="/descubra" rel="noopener noreferrer" target="_blank">
							Saiba mais
						</Link>
					</BaseButton>
				</div>
			</div>
		</div>
	);
};

export default ShareModal;
