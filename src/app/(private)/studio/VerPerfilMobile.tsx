// src/app/(private)/studio/VerPerfilMobile.tsx
"use client";

import { BaseButton } from "@/components/buttons/BaseButton";
import ShareSheet from "@/components/ShareSheet";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Download, ExternalLink } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { useCallback, useEffect, useRef, useState } from "react";

const VerPerfilMobile = () => {
	const { data: session } = useSession();
	const [profileUrl, setProfileUrl] = useState<string>("#");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
	const qrCodeRef = useRef<HTMLImageElement>(null);

	const username = session?.user?.username;
	const shareText = `Confira meu perfil na Bionk: ${
		session?.user?.name || username
	}`;

	useEffect(() => {
		const baseUrl =
			process.env.NODE_ENV === "production"
				? "https://www.bionk.me"
				: "http://localhost:3000";
		if (username) {
			setProfileUrl(`${baseUrl}/${username}`);
		}
	}, [username]);

	useEffect(() => {
		if (isModalOpen && profileUrl !== "#" && !qrCodeUrl) {
			QRCode.toDataURL(profileUrl, {
				width: 240,
				margin: 2,
				color: {
					dark: "#000000",
					light: "#ffffff",
				},
			}).then(setQrCodeUrl);
		}
	}, [isModalOpen, profileUrl, qrCodeUrl]);

	const handleDownloadQrCode = useCallback(() => {
		if (qrCodeUrl) {
			const link = document.createElement("a");
			link.href = qrCodeUrl;
			link.download = `${username}-bionk.png`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}, [qrCodeUrl, username]);

	return (
		<Dialog onOpenChange={setIsModalOpen} open={isModalOpen}>
			<DialogTrigger asChild>
				<BaseButton
					className="lg:hidden"
					disabled={!username}
					size="sm"
					variant="green"
				>
					<span className="flex items-center gap-2">
						<ExternalLink className="h-4 w-4" />
						Compartilhar
					</span>
				</BaseButton>
			</DialogTrigger>
			<DialogContent className="w-full max-w-[90vw] rounded-2xl border bg-background p-6 text-center shadow-xl sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="text-center font-bold text-2xl text-black">
						Compartilhar Perfil
					</DialogTitle>
					<DialogDescription className="pt-2 text-center text-muted-foreground text-sm">
						<p>Compartilhe seu perfil Bionk com o mundo.</p>
						<p className="break-all text-black text-sm">bionk.me/{username}</p>
					</DialogDescription>
				</DialogHeader>

				<div className="mt-4 flex min-w-0 flex-col gap-4">
					{qrCodeUrl && (
						<div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-gray-100 p-4">
							<Image
								alt="QR Code do perfil"
								className="h-48 w-48 rounded-md"
								height={192}
								ref={qrCodeRef}
								src={qrCodeUrl}
								width={192}
							/>
							<BaseButton
								className="w-full"
								onClick={handleDownloadQrCode}
								size="sm"
								variant="white"
							>
								<Download className="mr-2 size-4" />
								Baixar PNG
							</BaseButton>
						</div>
					)}

					<ShareSheet title={shareText} url={profileUrl} />

					<BaseButton
						asChild
						className="w-full justify-center"
						variant="default"
					>
						<Link href={profileUrl} rel="noopener noreferrer" target="_blank">
							<ExternalLink className="mr-2 size-4" />
							Abrir
						</Link>
					</BaseButton>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default VerPerfilMobile;
