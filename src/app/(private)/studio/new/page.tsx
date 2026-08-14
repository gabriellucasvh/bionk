"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import LoadingPage from "@/components/layout/LoadingPage";
import { SOCIAL_PLATFORMS } from "@/config/social-platforms";
import { getTemplateInfo } from "@/utils/templatePresets";
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
			document.cookie = `bionk_active_profile_id=${newProfileId}; path=/; max-age=2592000; SameSite=Lax`;

			// Aplicar template escolhido no novo perfil
			if (data.template) {
				try {
					const info = getTemplateInfo(data.template);
					await fetch("/api/update-template", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							template: data.template,
							templateCategory: info.category,
						}),
					});
				} catch {
					// Não bloquear o fluxo
				}
			}

			// Salvar redes sociais no novo perfil
			if (data.socialLinks && data.socialLinks.length > 0) {
				const platformMap = new Map(SOCIAL_PLATFORMS.map((p) => [p.key, p]));
				const socialPromises = data.socialLinks
					.map((item) => {
						const cfg = platformMap.get(item.platform);
						if (!cfg) {
							return null;
						}
						const base = cfg.baseUrl || "";
						const url = `${base}${item.username}`;
						return fetch("/api/social-links", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								platform: item.platform,
								username: item.username,
								url,
							}),
						});
					})
					.filter(Boolean) as Promise<Response>[];

				if (socialPromises.length > 0) {
					await Promise.all(socialPromises);
				}
			}

			// Salvar links customizados no novo perfil
			if (data.customLinks && data.customLinks.length > 0) {
				const linkPromises = data.customLinks.map((link) =>
					fetch("/api/links", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							title: link.title,
							url: link.url,
							active: true,
						}),
					})
				);
				await Promise.all(linkPromises);
			}

			// Limpar o cookie para não afetar outras telas acidentalmente (ou deixá-lo ativo)
			// Mas como a tela de sucesso vai referenciar o novo perfil, podemos mantê-lo ou limpá-lo.
			// Na verdade, a tela de sucesso vai ler o query string.
			
			// Redirecionar para a tela de sucesso
			router.push(`/studio/success?username=${encodeURIComponent(result.profile.username)}`);
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
		<div className="bg-white dark:bg-zinc-950 min-h-screen">
			<OnboardingPageComponent
				error={error}
				initialData={{
					name: "",
					username: "",
				}}
				isLoading={isLoading}
				onComplete={handleOnboardingComplete}
				requireUsername={true}
				hideStep6={true}
				onCancel={() => router.push("/studio")}
			/>
		</div>
	);
}
