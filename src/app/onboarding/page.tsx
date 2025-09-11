"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import LoadingPage from "@/components/layout/LoadingPage";
import OnboardingPageComponent, {
	type OnboardingData,
} from "../(private)/studio/onboarding/onboarding-page";

export default function OnboardingPage() {
	const { data: session, status, update } = useSession();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleOnboardingComplete = async (data: OnboardingData) => {
		setIsLoading(true);
		setError(null);

		try {
			// Verificar se o username já existe
			const checkResponse = await fetch(
				`/api/auth/check-username?username=${encodeURIComponent(data.username)}`
			);

			if (!checkResponse.ok) {
				const errorData = await checkResponse.json();
				throw new Error(errorData.error || "Erro ao verificar username");
			}

			const response = await fetch("/api/onboarding/complete", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Erro ao completar onboarding");
			}

			const result = await response.json();

			// Atualizar a sessão com os novos dados
			await update({
				user: {
					...session?.user,
					username: result.user.username,
					name: result.user.name,
					image: result.user.image,
					onboardingCompleted: result.user.onboardingCompleted,
					status: result.user.status,
				},
			});

			// Redirecionar para o perfil
			router.push("/studio/perfil");
		} finally {
			setIsLoading(false);
		}
	};

	// Redirecionar se não estiver autenticado
	useEffect(() => {
		if (status === "loading") {
			return;
		}
		if (!session) {
			router.push("/registro");
			return;
		}
		// Redirecionar se já completou o onboarding
		if (session.user.status === "active") {
			router.push("/studio/perfil");
			return;
		}
	}, [session, status, router]);

	if (status === "loading") {
		return <LoadingPage />;
	}

	if (!session || session.user.status !== "pending") {
		return null;
	}

	return (
		<OnboardingPageComponent
			error={error}
			isLoading={isLoading}
			onComplete={handleOnboardingComplete}
			user={{
				id: session.user.id,
				name: session.user.name || "",
				email: session.user.email || "",
				image: session.user.image,
				onboardingCompleted: session.user.onboardingCompleted,
			}}
		/>
	);
}
