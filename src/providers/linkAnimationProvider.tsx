"use client";

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

	// Carregar estado inicial dos links animados
	useEffect(() => {
		const loadAnimatedLinks = async () => {
			try {
				// Primeiro, obter a sessão do usuário
				const sessionResponse = await fetch("/api/auth/session");
				if (!sessionResponse.ok) {
					return;
				}

				const sessionData = await sessionResponse.json();
				if (!sessionData?.user?.id) {
					return;
				}

				const response = await fetch(
					`/api/links?userId=${sessionData.user.id}`
				);
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
	}, []);

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
