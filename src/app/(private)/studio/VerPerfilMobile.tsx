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
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { QRCode } from "react-qrcode-logo";

const VerPerfilMobile = () => {
	const { data: session } = useSession();
	const [profileUrl, setProfileUrl] = useState<string>("#");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const qrCodeRef = useRef<HTMLDivElement>(null);

	const username = session?.user?.username;
	const shareText = `Confira meu perfil na Bionk: ${
		username || session?.user?.name
	}`;
	const logoUrl = "/bionk-logo-quadrado-pb.svg";

	useEffect(() => {
		const baseUrl =
			process.env.NODE_ENV === "production"
				? "https://www.bionk.me"
				: "http://localhost:3000";
		if (username) {
			setProfileUrl(`${baseUrl}/${username}`);
		}
	}, [username]);

	const handleDownloadQrCode = useCallback(() => {
		const canvas =
			qrCodeRef.current?.querySelector<HTMLCanvasElement>("canvas");
		if (canvas) {
			const link = document.createElement("a");
			link.href = canvas.toDataURL("image/png");
			link.download = `${username}-bionk-qrcode.png`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}, [username]);

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
			<DialogContent className="w-full max-w-[90vw] rounded-3xl border bg-background p-6 text-center shadow-xl sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="text-center font-bold text-2xl text-black dark:text-white">
						Compartilhar Perfil
					</DialogTitle>
					<DialogDescription className="pt-2 text-center text-muted-foreground text-sm dark:text-white/80">
						<span>Compartilhe seu perfil Bionk com o mundo.</span>
						<br />
						<span className="break-all text-black text-sm dark:text-white">
							bionk.me/{username}
						</span>
					</DialogDescription>
				</DialogHeader>

				<div className="mt-4 flex min-w-0 flex-col gap-4">
					{isModalOpen && profileUrl !== "#" && (
						<div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-gray-100 p-4">
							<div ref={qrCodeRef}>
								<QRCode
									logoImage={logoUrl}
									logoPadding={5}
									logoWidth={30}
									qrStyle="dots"
									size={192}
									value={profileUrl}
								/>
							</div>
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
