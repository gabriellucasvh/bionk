"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Theme = "light" | "dark";

interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
	setTheme: (theme: Theme) => void;
	isAutoMode: boolean;
	setAutoMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setThemeState] = useState<Theme>("light");
	const [mounted, setMounted] = useState(false);
	const [isAutoMode, setIsAutoMode] = useState(false);
	const pathname = usePathname();

	// Carrega o tema do localStorage na inicialização
	useEffect(() => {
		const savedAutoMode = localStorage.getItem("bionk-studio-auto-mode");
		const savedTheme = localStorage.getItem("bionk-studio-theme") as Theme;

		if (savedAutoMode === "true") {
			setIsAutoMode(true);
			const systemPrefersDark = window.matchMedia(
				"(prefers-color-scheme: dark)"
			).matches;
			setThemeState(systemPrefersDark ? "dark" : "light");
		} else if (
			savedTheme &&
			(savedTheme === "light" || savedTheme === "dark")
		) {
			setThemeState(savedTheme);
		} else {
			// Define modo claro como padrão
			setThemeState("light");
		}
		setMounted(true);
	}, []);

	// Aplica o tema ao documento apenas nas rotas do studio
	useEffect(() => {
		if (mounted) {
			const root = document.documentElement;
			const isStudioRoute = pathname?.startsWith('/studio');
			
			if (isStudioRoute) {
				if (theme === "dark") {
					root.classList.add("dark");
				} else {
					root.classList.remove("dark");
				}
				localStorage.setItem("bionk-studio-theme", theme);
			} else {
				// Remove a classe dark quando não estiver no studio
				root.classList.remove("dark");
			}
		}
	}, [theme, mounted, pathname]);

	const toggleTheme = () => {
		setThemeState((prev) => (prev === "light" ? "dark" : "light"));
	};

	const setTheme = (newTheme: Theme) => {
		setThemeState(newTheme);
		setIsAutoMode(false);
		localStorage.removeItem("bionk-studio-auto-mode");
	};

	const setAutoMode = () => {
		const systemPrefersDark = window.matchMedia(
			"(prefers-color-scheme: dark)"
		).matches;
		setThemeState(systemPrefersDark ? "dark" : "light");
		setIsAutoMode(true);
		localStorage.setItem("bionk-studio-auto-mode", "true");
	};

	// Evita hidratação mismatch
	if (!mounted) {
		return (
			<ThemeContext.Provider
				value={{
					theme: "light",
					toggleTheme: () => {},
					setTheme: () => {},
					isAutoMode: false,
					setAutoMode: () => {},
				}}
			>
				<div className="opacity-0">{children}</div>
			</ThemeContext.Provider>
		);
	}

	return (
		<ThemeContext.Provider
			value={{ theme, toggleTheme, setTheme, isAutoMode, setAutoMode }}
		>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}
