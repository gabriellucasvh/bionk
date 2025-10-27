"use client";

import { Crown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProButtonProps = {
	href?: string;
	onClick?: () => void;
	className?: string;
	size?: "xs" | "sm" | "md" | "lg";
	disabled?: boolean;
	label?: string;
	tooltip?: string;
};

/**
 * Botão global para indicar funcionalidades PRO.
 * Use em locais onde um recurso é exclusivo para planos pagos.
 */
export function ProButton({
	href = "/planos",
	onClick,
	className,
	size = "sm",
	disabled = false,
	label = "PRO",
	tooltip = "Disponível no plano Básico ou superior",
}: ProButtonProps) {
	const baseClasses = cn(
		"inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold text-xs",
		"bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white",
		"shadow-sm transition-shadow hover:shadow-md",
		size === "xs" && "px-2 py-0.5 text-xs",
		size === "md" && "px-3 py-1.5 text-sm",
		size === "lg" && "px-3.5 py-2 text-sm",
		disabled && "cursor-not-allowed opacity-70",
		className
	);

	const content = (
		<span aria-label={tooltip} className={baseClasses} title={tooltip}>
			<Crown className="h-3.5 w-3.5" />
			<span>{label}</span>
		</span>
	);

	if (href && !disabled) {
		return (
			<Link aria-disabled={disabled} href={href} onClick={onClick}>
				{content}
			</Link>
		);
	}

	return (
		<Button
			className="h-auto p-0"
			disabled={disabled}
			onClick={onClick}
			title={tooltip}
			variant="ghost"
		>
			{content}
		</Button>
	);
}
