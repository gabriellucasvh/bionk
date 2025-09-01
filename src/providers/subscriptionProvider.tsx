"use client";

import { useSession } from "next-auth/react";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type SubscriptionContextType = {
	subscriptionPlan: string | null;
	refreshSubscriptionPlan: () => Promise<void>;
	isLoading: boolean;
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
	undefined
);

export function SubscriptionProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: session } = useSession();
	const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const fetchSubscriptionPlan = async () => {
		if (!session?.user?.id) {
			setSubscriptionPlan(null);
			setIsLoading(false);
			return;
		}

		try {
			const res = await fetch("/api/user-plan");
			if (res.ok) {
				const data = await res.json();
				setSubscriptionPlan(data.subscriptionPlan);
			} else {
				setSubscriptionPlan("free");
			}
		} catch {
			setSubscriptionPlan("free");
		} finally {
			setIsLoading(false);
		}
	};

	const refreshSubscriptionPlan = async () => {
		setIsLoading(true);
		await fetchSubscriptionPlan();
	};

	useEffect(() => {
		fetchSubscriptionPlan();
	});

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
