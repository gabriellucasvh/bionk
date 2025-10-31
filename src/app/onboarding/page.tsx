"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import LoadingPage from "@/components/layout/LoadingPage";
import { SOCIAL_PLATFORMS } from "@/config/social-platforms";
import { getTemplateInfo } from "@/utils/templatePresets";
import OnboardingPageComponent, {
	type OnboardingData,
} from "../(private)/studio/onboarding/onboarding-page";

export default function OnboardingPage() {
	const { data: session, status, update } = useSession();
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
			// Verificar se o username já existe
			const checkResponse = await fetch(
				`/api/auth/check-username?username=${encodeURIComponent(data.username)}`
			);

			if (!checkResponse.ok) {
				const errorData = await checkResponse.json();
				throw new Error(errorData.error || "Erro ao verificar username");
			}

			// Prepara payload JSON e converte imagem para base64, se existir
			const payload: any = {
				name: data.name,
				username: data.username,
				bio: data.bio,
				userType: data.userType,
				plan: data.plan,
			};
			if (data.profileImage) {
				payload.profileImage = await fileToDataUrl(data.profileImage);
			}

			const response = await fetch("/api/onboarding/complete", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
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

			// Aplicar template escolhido
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
					// Não bloquear o fluxo caso falhe a aplicação do template
				}
			}

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
					const results = await Promise.all(socialPromises);
					const failed = results.filter((r) => !r.ok);
					if (failed.length > 0) {
						const errors = await Promise.all(
							failed.map((r) => r.json().catch(() => ({})))
						);
						const msg =
							(errors[0] as any)?.error || "Erro ao salvar rede social";
						throw new Error(msg);
					}
				}
			}

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
				const results = await Promise.all(linkPromises);
				const failed = results.filter((r) => !r.ok);
				if (failed.length > 0) {
					const errors = await Promise.all(
						failed.map((r) => r.json().catch(() => ({})))
					);
					const msg =
						(errors[0] as any)?.error || "Erro ao salvar link personalizado";
					throw new Error(msg);
				}
			}

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
