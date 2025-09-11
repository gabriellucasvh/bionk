"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import LoadingPage from "@/components/layout/LoadingPage";
import { Button } from "@/components/ui/button";
import OnboardingPageComponent, {
	type OnboardingData,
} from "./onboarding-page";

export default function OnboardingPage() {
	const { data: session, update } = useSession();
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleOnboardingComplete = async (data: OnboardingData) => {
		setLoading(true);
		setError(null);

		try {
			const formData = new FormData();
			formData.append("name", data.name);
			formData.append("username", data.username);
			formData.append("bio", data.bio);

			if (data.profileImage) {
				formData.append("profileImage", data.profileImage);
			}

			const response = await fetch("/api/auth/complete-onboarding", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Erro ao completar onboarding");
			}

			// Atualizar a sessão
			await update();

			// Redirecionar para o studio
			router.push("/studio");
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = async () => {
		await signOut({ callbackUrl: "/" });
	};

	if (!session?.user) {
		return <LoadingPage />;
	}

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-white p-4 dark:from-gray-900 dark:to-gray-800">
				<div className="w-full max-w-md text-center">
					<div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
						{error}
					</div>
					<Button onClick={handleLogout} size="sm" variant="outline">
						Sair da conta
					</Button>
				</div>
			</div>
		);
	}

	return (
		<OnboardingPageComponent
			initialData={{
				name: session?.user?.name || "",
				username: session?.user?.username || "",
			}}
			loading={loading}
			onComplete={handleOnboardingComplete}
			user={session?.user}
		/>
	);
}
