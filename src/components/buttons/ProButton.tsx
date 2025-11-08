"use client";

import { Check, Sparkle, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BaseButton } from "@/components/buttons/BaseButton";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ProButtonProps = {
	href?: string;
	onClick?: () => void;
	className?: string;
	size?: "xs" | "sm" | "md" | "lg";
	disabled?: boolean;
	label?: string;
	tooltip?: string;
	showOverlayTooltip?: boolean;
};

/**
 * Botão global para indicar funcionalidades PRO.
 * Usa um tooltip estilizado em Tailwind acima do botão.
 */
export function ProButton({
	href = "/planos",
	onClick,
	className,
	size = "sm",
	disabled = false,
	label = "Pro",
	tooltip = "Saiba mais sobre as funcionalidades PRO",
	showOverlayTooltip = true,
}: ProButtonProps) {
	const baseClasses = cn(
		"inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold text-xs",
		"bg-black/80 dark:bg-white dark:text-black",
		"shadow-sm transition-shadow hover:shadow-md",
		size === "xs" && "px-2 py-0.5 text-xs",
		size === "md" && "px-3 py-1.5 text-sm",
		size === "lg" && "px-3.5 py-2 text-sm",
		disabled && "cursor-not-allowed opacity-70",
		className
	);

	const content = (
		<span className="group relative inline-block">
			<span className={baseClasses}>
				<Sparkle className="h-3.5 w-3.5 text-white dark:text-black" />
				<span className="text-white dark:text-black">{label}</span>
			</span>
			{showOverlayTooltip && tooltip && (
				<span
					className={cn(
						"-translate-x-1/2 -top-10 absolute left-1/2",
						"whitespace-nowrap rounded-full bg-black/90 px-3 py-2 text-sm text-white",
						"pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100",
						"z-50"
					)}
				>
					{tooltip}
				</span>
			)}
		</span>
	);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<button
					className="h-auto p-0"
					disabled={disabled}
					onClick={onClick}
					type="button"
				>
					{content}
				</button>
			</DialogTrigger>
			<DialogContent
				className="top-auto right-0 bottom-0 left-0 w-full max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-t-3xl border-none p-0 sm:top-1/2 sm:right-auto sm:bottom-auto sm:left-1/2 sm:max-w-2xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-3xl"
				showCloseButton={false}
			>
				<DialogClose className="absolute top-4 right-4 rounded-full bg-white p-2 dark:bg-zinc-800">
					<X className="h-4 w-4" />
				</DialogClose>
				<DialogTitle className="hidden font-bold text-xl">
					Desbloqueie o Bionk PRO
				</DialogTitle>
				<div className="md:hidden">
					<Image
						alt="Bionk PRO"
						className="h-55 w-full object-cover object-top"
						height={112}
						src="/images/stylish-pro.png"
						width={640}
					/>
				</div>
				<div className="grid gap-0 md:grid-cols-2">
					<div className="hidden md:block">
						<Image
							alt="Bionk PRO"
							className="h-full w-full rounded-l-3xl object-cover"
							height={360}
							src="/images/stylish-pro.png"
							width={640}
						/>
					</div>
					<div className="flex flex-col gap-4 p-6 text-sm">
						<h3 className="font-bold text-3xl md:mt-10">
							Desbloqueie o Bionk PRO
						</h3>
						<ul className="space-y-3">
							<li className="flex items-center gap-2">
								<Check className="h-5 w-5 text-green-600" />
								<span>Templates premium exclusivos</span>
							</li>
							<li className="flex items-center gap-2">
								<Check className="h-5 w-5 text-green-600" />
								<span>Análises avançadas de cliques e tráfego</span>
							</li>
							<li className="flex items-center gap-2">
								<Check className="h-5 w-5 text-green-600" />
								<span>Links ilimitados e organização melhorada</span>
							</li>
							<li className="flex items-center gap-2">
								<Check className="h-5 w-5 text-green-600" />
								<span>Remoção de marca d’água</span>
							</li>
							<li className="flex items-center gap-2">
								<Check className="h-5 w-5 text-green-600" />
								<span>Automação e agendamento de conteúdo</span>
							</li>
							<li className="flex items-center gap-2">
								<Check className="h-5 w-5 text-green-600" />
								<span>Suporte prioritário</span>
							</li>
						</ul>
						<BaseButton asChild fullWidth>
							<Link href={href}>Atualizar plano</Link>
						</BaseButton>
						<span className="text-center text-muted-foreground text-xs">
							Você pode cancelar a qualquer momento.
						</span>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
