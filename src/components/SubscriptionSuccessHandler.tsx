"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSubscription } from "@/providers/subscriptionProvider";

export function SubscriptionSuccessHandler() {
	const searchParams = useSearchParams();
	const { refreshSubscriptionPlan } = useSubscription();

	useEffect(() => {
		const subscriptionParam = searchParams.get("subscription");
		
		if (subscriptionParam === "success") {
			// Aguarda um pouco para garantir que o webhook já processou
			const timer = setTimeout(() => {
				refreshSubscriptionPlan();
			}, 2000);

			return () => clearTimeout(timer);
		}
	}, [searchParams, refreshSubscriptionPlan]);

	return null;
}