"use client";

import { usePathname } from "next/navigation";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface LinkAnimationContextType {
	animatedLinks: Set<string>;
	toggleAnimation: (linkId: number) => Promise<void>;
	clearAllAnimations: () => void;
}

const LinkAnimationContext = createContext<
	LinkAnimationContextType | undefined
>(undefined);

export function LinkAnimationProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [animatedLinks, setAnimatedLinks] = useState<Set<string>>(new Set());
	const pathname = usePathname();

	// Carregar estado inicial dos links animados SOMENTE nas rotas do Studio
	useEffect(() => {
		// Evita requisições em páginas públicas; só roda no Studio
		if (!pathname?.startsWith("/studio")) {
			setAnimatedLinks(new Set());
			return;
		}

		const loadAnimatedLinks = async () => {
			try {
				// Obtém a sessão do usuário apenas no Studio
				const sessionResponse = await fetch("/api/auth/session");
				if (!sessionResponse.ok) {
					return;
				}

				const sessionData = await sessionResponse.json();
				if (!sessionData?.user?.id) {
					return;
				}

				const response = await fetch("/api/links");
				if (response.ok) {
					const data = await response.json();
					const animatedLinkIds = data.links
						.filter((link: any) => link.animated)
						.map((link: any) => link.id.toString());
					setAnimatedLinks(new Set(animatedLinkIds));
				}
			} catch (error) {
				console.error("Erro ao carregar links animados:", error);
			}
		};

		loadAnimatedLinks();
	}, [pathname]);

	const toggleAnimation = async (linkId: number) => {
		try {
			const response = await fetch(`/api/links/${linkId}/animate`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (response.ok) {
				const data = await response.json();
				const linkIdStr = linkId.toString();

				setAnimatedLinks((prev) => {
					const newSet = new Set(prev);
					if (data.animated) {
						newSet.add(linkIdStr);
					} else {
						newSet.delete(linkIdStr);
					}
					return newSet;
				});
			}
		} catch (error) {
			console.error("Erro ao alternar animação:", error);
		}
	};

	const clearAllAnimations = () => {
		setAnimatedLinks(new Set());
	};

	return (
		<LinkAnimationContext.Provider
			value={{
				animatedLinks,
				toggleAnimation,
				clearAllAnimations,
			}}
		>
			{children}
		</LinkAnimationContext.Provider>
	);
}

export function useLinkAnimation() {
	const context = useContext(LinkAnimationContext);
	if (context === undefined) {
		throw new Error(
			"useLinkAnimation must be used within a LinkAnimationProvider"
		);
	}
	return context;
}
