"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import type React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

type SubscriptionContextType = {
	subscriptionPlan: string | null;
	refreshSubscriptionPlan: () => Promise<void>;
	isLoading: boolean;
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
	undefined
);

// Cache global para evitar múltiplas chamadas
const subscriptionCache = new Map<
	string,
	{
		plan: string;
		timestamp: number;
		promise?: Promise<string>;
	}
>();

// Tempo de cache em milliseconds (5 minutos)
const CACHE_DURATION = 5 * 60 * 1000;

// Função para limpar cache expirado
const cleanExpiredCache = () => {
	const now = Date.now();
	for (const [userId, cached] of subscriptionCache.entries()) {
		if (now - cached.timestamp > CACHE_DURATION) {
			subscriptionCache.delete(userId);
		}
	}
};

// Função para limpar todo o cache (útil no logout)
export const clearSubscriptionCache = () => {
	subscriptionCache.clear();
};

// Função para invalidar cache de um usuário específico
export const invalidateUserSubscriptionCache = (userId: string) => {
	subscriptionCache.delete(userId);
};

// Limpeza automática do cache a cada 10 minutos
setInterval(cleanExpiredCache, 10 * 60 * 1000);

export function SubscriptionProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: session } = useSession();
	const pathname = usePathname();
	const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const lastSessionId = useRef<string | null>(null);
	const hasInitialized = useRef(false);

	const fetchSubscriptionPlan = async (): Promise<string> => {
		// Busca o plano apenas dentro do Studio
		const isStudioRoute = pathname?.startsWith("/studio") === true;
		if (!(isStudioRoute && session?.user?.id)) {
			return "free";
		}

		const userId = session.user.id;
		const now = Date.now();
		const cached = subscriptionCache.get(userId);

		// Verifica se existe cache válido
		if (cached && now - cached.timestamp < CACHE_DURATION) {
			// Se existe uma promise em andamento, aguarda ela
			if (cached.promise) {
				return await cached.promise;
			}
			return cached.plan;
		}

		// Se já existe uma promise em andamento para este usuário, aguarda ela
		if (cached?.promise) {
			return await cached.promise;
		}

		// Cria nova promise para buscar o plano
		const fetchPromise = (async () => {
			try {
				const res = await fetch("/api/user-plan");
				if (res.ok) {
					const data = await res.json();
					return data.subscriptionPlan || "free";
				}
				return "free";
			} catch {
				return "free";
			}
		})();

		// Armazena a promise no cache temporariamente
		subscriptionCache.set(userId, {
			plan: cached?.plan || "free",
			timestamp: cached?.timestamp || 0,
			promise: fetchPromise,
		});

		try {
			const plan = await fetchPromise;

			// Atualiza o cache com o resultado
			subscriptionCache.set(userId, {
				plan,
				timestamp: now,
				promise: undefined,
			});

			return plan;
		} catch (error) {
			// Remove a promise do cache em caso de erro
			subscriptionCache.delete(userId);
			throw error;
		}
	};

	const refreshSubscriptionPlan = async () => {
		if (!(session?.user?.id && pathname?.startsWith("/studio"))) {
			return;
		}

		setIsLoading(true);
		subscriptionCache.delete(session.user.id);

		try {
			const plan = await fetchSubscriptionPlan();
			setSubscriptionPlan(plan);
		} catch {
			setSubscriptionPlan("free");
		} finally {
			setIsLoading(false);
		}
	};

	// Efeito para inicializar o plano quando a sessão muda (apenas no Studio)
	useEffect(() => {
		const currentSessionId = session?.user?.id;
		const previousSessionId = lastSessionId.current;
		const isStudioRoute = pathname?.startsWith("/studio") === true;

		// Fora do Studio: não buscar plano
		if (!isStudioRoute) {
			setSubscriptionPlan("free");
			setIsLoading(false);
			lastSessionId.current = currentSessionId || null;
			hasInitialized.current = false;
			return;
		}

		// Se não há sessão, limpa o estado
		if (!currentSessionId) {
			if (previousSessionId) {
				invalidateUserSubscriptionCache(previousSessionId);
			}
			setSubscriptionPlan(null);
			setIsLoading(false);
			lastSessionId.current = null;
			hasInitialized.current = false;
			return;
		}

		if (currentSessionId !== previousSessionId || !hasInitialized.current) {
			if (previousSessionId && previousSessionId !== currentSessionId) {
				invalidateUserSubscriptionCache(previousSessionId);
			}

			lastSessionId.current = currentSessionId;
			hasInitialized.current = true;
			setIsLoading(true);

			fetchSubscriptionPlan()
				.then((plan) => {
					setSubscriptionPlan(plan);
				})
				.catch(() => {
					setSubscriptionPlan("free");
				})
				.finally(() => {
					setIsLoading(false);
				});
		}
	}, [session?.user?.id, pathname]);

	return (
		<SubscriptionContext.Provider
			value={{
				subscriptionPlan,
				refreshSubscriptionPlan,
				isLoading,
			}}
		>
			{children}
		</SubscriptionContext.Provider>
	);
}

export function useSubscription() {
	const context = useContext(SubscriptionContext);
	if (context === undefined) {
		throw new Error(
			"useSubscription must be used within a SubscriptionProvider"
		);
	}
	return context;
}
