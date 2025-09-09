"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/themeProvider";

interface ThemeToggleProps {
	variant?: "default" | "ghost" | "outline";
	size?: "default" | "sm" | "lg" | "icon";
	showLabel?: boolean;
	className?: string;
}

export function ThemeToggle({ 
	variant = "ghost", 
	size = "icon", 
	showLabel = false,
	className = ""
}: ThemeToggleProps) {
	const { theme, toggleTheme } = useTheme();

	return (
		<Button
			variant={variant}
			size={size}
			onClick={toggleTheme}
			className={`transition-colors ${className}`}
			title={theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
		>
			{theme === "light" ? (
				<Moon className="h-4 w-4" />
			) : (
				<Sun className="h-4 w-4" />
			)}
			{showLabel && (
				<span className="ml-2">
					{theme === "light" ? "Modo Escuro" : "Modo Claro"}
				</span>
			)}
		</Button>
	);
}

export default ThemeToggle;