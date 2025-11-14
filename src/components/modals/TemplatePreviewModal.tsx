"use client";

import { ArrowRight, Globe, LinkIcon, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface Template {
	id: string;
	name: string;
	image: string;
}

interface TemplatePreviewModalProps {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	template: Template | null;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
	isOpen,
	onOpenChange,
	template,
}) => {
	if (!template) {
		return null;
	}

	return (
		<Dialog onOpenChange={onOpenChange} open={isOpen}>
			{/* CHANGED: padding movido do conteúdo para o DialogContent e classes padronizadas */}
			<DialogContent className="w-full max-w-[90vw] rounded-3xl border bg-background p-6 shadow-xl sm:max-w-lg">
				{/* CHANGED: Tamanho do logo ajustado para consistência */}
				<div className="flex justify-center pb-2">
					<Image
						alt="Bionk Logo"
						className="mx-auto h-auto w-24" // Ajustado
						height={50}
						src="/images/bionk-name-logo.svg"
						width={100}
					/>
				</div>

				<DialogHeader className="pt-2 text-center">
					<DialogTitle className="font-bold text-xl sm:text-2xl">
						Junte-se ao Bionk
					</DialogTitle>
					<DialogDescription className="text-sm sm:text-base">
						Crie sua página, compartilhe seus links e conecte-se com o mundo.
					</DialogDescription>
				</DialogHeader>

				<div>
					<Separator className="my-4" />

					<div className="grid grid-cols-1 gap-4 py-4">
						{[
							{
								icon: <Globe className="h-4 w-4" />,
								title: "Sua presença online",
								desc: "Crie um perfil único que represente você ou sua marca.",
								bg: "bg-blue-100 text-blue-600",
							},
							{
								icon: <LinkIcon className="h-4 w-4" />,
								title: "Todos os seus links",
								desc: "Reúna todos os seus conteúdos em um só lugar.",
								bg: "bg-purple-100 text-purple-600",
							},
							{
								icon: <Share2 className="h-4 w-4" />,
								title: "Compartilhe facilmente",
								desc: "Compartilhe seu perfil em qualquer lugar com um único link.",
								bg: "bg-green-100 text-green-600",
							},
						].map((item) => (
							<div className="flex items-start gap-3" key={item.bg}>
								<div
									className={`flex h-8 w-8 items-center justify-center rounded-full ${item.bg}`}
								>
									{item.icon}
								</div>
								<div>
									<h3 className="font-medium text-base sm:text-lg">
										{item.title}
									</h3>
									<p className="text-muted-foreground text-sm">{item.desc}</p>
								</div>
							</div>
						))}
					</div>

					<Separator className="my-4" />

					<p className="mt-4 text-center text-muted-foreground text-sm sm:text-base">
						Junte-se a milhares de criadores que já estão usando o{" "}
						<strong>Bionk</strong> para expandir sua presença online.
					</p>
				</div>

				<DialogFooter className="pt-2">
					<Link
						className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-avocado-400 px-4 py-2 text-center font-medium text-black transition-colors duration-300 hover:bg-avocado-500"
						href="https://www.bionk.me/registro"
						rel="noopener noreferrer"
						target="_blank"
					>
						Começar agora
						<ArrowRight className="ml-2 h-4 w-4" />
					</Link>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default TemplatePreviewModal;
