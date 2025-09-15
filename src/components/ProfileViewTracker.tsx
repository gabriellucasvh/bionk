// components/ProfileViewTracker.tsx
"use client";

import { useEffect } from "react";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { detectTrafficSource } from "@/utils/traffic-source";

interface ProfileViewTrackerProps {
	userId: string;
}

const ProfileViewTracker: React.FC<ProfileViewTrackerProps> = ({ userId }) => {
	const { canUseAnalytics, isLoading } = useCookieConsent();

	useEffect(() => {
		// Aguardar o carregamento das preferências de cookies
		if (isLoading) {
			return;
		}

		// Só fazer tracking se o usuário consentiu com cookies de análise
		if (!canUseAnalytics()) {
			console.log(
				"Analytics cookies not allowed, skipping profile view tracking"
			);
			return;
		}

		const trafficSource = detectTrafficSource();

		fetch("/api/profile-view", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				userId,
				trafficSource, // Enviar a origem detectada
			}),
		}).catch((error) => console.error("Failed to record profile view:", error));
	}, [userId, canUseAnalytics, isLoading]);

	return null;
};

export default ProfileViewTracker;
