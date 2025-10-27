"use client";

import { Sparkle } from "lucide-react";
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
}: ProButtonProps) {
	const baseClasses = cn(
		"inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold text-xs",
		"bg-black/70 text-white transition-all duration-700 hover:bg-black/80",
		"shadow-sm transition-shadow hover:shadow-md",
		size === "xs" && "px-2 py-0.5 text-xs",
		size === "md" && "px-3 py-1.5 text-sm",
		size === "lg" && "px-3.5 py-2 text-sm",
		disabled && "cursor-not-allowed opacity-70",
		className
	);

	const content = (
		<span className="group relative inline-block">
			{/* Botão */}
			<span
				className={baseClasses}
				onMouseEnter={(e) => {
					e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.8)";
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.7)";
				}}
				role="none"
				style={{
					backgroundColor: "rgba(0,0,0,0.7)",
					color: "white",
					border: "none",
					transition: "background-color 400ms ease",
				}}
			>
				<Sparkle className="h-3.5 w-3.5" />
				<span>{label}</span>
			</span>

			{/* Tooltip */}
			<span
				className={cn(
					"-translate-x-1/2 -top-10 absolute left-1/2",
					"whitespace-nowrap rounded-full bg-black/90 px-3 py-2 text-sm text-white",
					"pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				)}
			>
				{tooltip}
			</span>
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
			variant="ghost"
		>
			{content}
		</Button>
	);
}
