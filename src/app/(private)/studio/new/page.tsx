"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import LoadingPage from "@/components/layout/LoadingPage";
import OnboardingPageComponent, {
	type OnboardingData,
} from "../onboarding/onboarding-page";

export default function NewProfilePage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Converte File para base64 data URL
	const fileToDataUrl = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = (e) => reject(e);
			reader.readAsDataURL(file);
		});
	};

	const handleOnboardingComplete = async (data: OnboardingData) => {
		setIsLoading(true);
		setError(null);

		try {
			// Prepara payload JSON e converte imagem para base64, se existir
			const payload: any = {
				name: data.name,
				username: data.username,
				bio: data.bio,
				userType: data.userType,
				template: data.template,
				socialLinks: data.socialLinks,
				customLinks: data.customLinks,
			};
			if (data.profileImage) {
				payload.profileImage = await fileToDataUrl(data.profileImage);
			}

			// Chamada para a nova rota de criação de perfil vinculado
			const response = await fetch("/api/profile/create-linked", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Erro ao criar nova página");
			}

			const result = await response.json();
			const newProfileId = result.profile.id;

			// Definir o cookie com o ID do novo perfil para que as chamadas seguintes atuem sobre ele
			Cookies.set("bionk_active_profile_id", newProfileId, {
				path: "/",
				expires: 30,
				sameSite: "lax",
			});

			// Redirecionar para a tela de sucesso
			router.push(
				`/studio/success?username=${encodeURIComponent(result.profile.username)}`
			);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	if (status === "loading") {
		return <LoadingPage />;
	}

	if (!session) {
		router.push("/login");
		return null;
	}

	return (
		<div className="min-h-screen bg-white dark:bg-zinc-950">
			<OnboardingPageComponent
				error={error}
				hideStep6={true}
				initialData={{
					name: "",
					username: "",
				}}
				isLoading={isLoading}
				onCancel={() => router.push("/studio")}
				onComplete={handleOnboardingComplete}
				requireUsername={true}
			/>
		</div>
	);
}
