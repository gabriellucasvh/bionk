"use client";

import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";
import { QRCode } from "react-qrcode-logo";
import { BaseButton } from "@/components/buttons/BaseButton";
import ShareSheet from "@/components/ShareSheet";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogBottomSheetContent } from "@/components/ui/dialog-bottom-sheet";
import type { TemplateComponentProps } from "@/types/user-profile";

interface ShareBottomSheetProps {
	user: TemplateComponentProps["user"];
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

const ShareBottomSheet: FC<ShareBottomSheetProps> = ({
	user,
	isOpen,
	onOpenChange,
}) => {
	const profileUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://bionk.me"}/${user.username}`;
	const shareText = `Confira meu perfil na Bionk: ${user.username || user.name}`;
	const logoUrl = "/images/bionk-icon-black.svg";

	return (
		<Dialog onOpenChange={onOpenChange} open={isOpen}>
			<DialogBottomSheetContent>
				<DialogHeader className="sr-only">
					<DialogTitle>Compartilhar Perfil</DialogTitle>
				</DialogHeader>
				<div className="flex justify-center pb-2">
					<Image
						alt="Bionk Logo"
						className="mx-auto h-auto w-20"
						height={40}
						src="/images/bionk-name-logo.svg"
						width={80}
					/>
				</div>

				<div className="text-center">
					<h2 className="font-bold text-2xl text-black">Compartilhar Perfil</h2>
					<p className="pt-2 text-muted-foreground text-sm">
						Divulgue seu perfil Bionk usando link, QR code ou redes sociais.
					</p>
				</div>

				<div className="mt-4 flex min-w-0 flex-col gap-4">
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
								bionk.me/{user.username}
							</span>
						</div>
					)}

					<ShareSheet title={shareText} url={profileUrl} />

					<div className="mt-4 mb-6 flex w-full flex-col gap-3">
						<BaseButton asChild className="w-full">
							<Link href="/registro" rel="noopener noreferrer" target="_blank">
								Crie sua conta na Bionk
							</Link>
						</BaseButton>
					</div>
				</div>
			</DialogBottomSheetContent>
		</Dialog>
	);
};

export default ShareBottomSheet;
