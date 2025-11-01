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
			};
			if (data.profileImage) {
				payload.profileImage = await fileToDataUrl(data.profileImage);
			}

			const isGoogle = Boolean(
				session?.user?.provider === "google" || session?.user?.googleId
			);
			const completionEndpoint = isGoogle
				? "/api/onboarding/complete"
				: "/api/auth/complete-onboarding";
			const response = await fetch(completionEndpoint, {
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
					username: result.user.username ?? session?.user?.username,
					name: result.user.name ?? session?.user?.name,
					image: result.user.image ?? session?.user?.image,
					onboardingCompleted: result.user.onboardingCompleted ?? true,
					status: result.user.status ?? session?.user?.status,
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
		if (session.user.onboardingCompleted) {
			router.push("/studio/perfil");
			return;
		}
	}, [session, status, router]);

	if (status === "loading") {
		return <LoadingPage />;
	}

	const canShowOnboarding =
		Boolean(session) && !session?.user?.onboardingCompleted;

	if (!canShowOnboarding) {
		return <LoadingPage />;
	}

	const user = session?.user || null;

	return (
		<OnboardingPageComponent
			error={error}
			initialData={{
				name: user?.name ?? user?.username ?? "",
				username: user?.username ?? "",
			}}
			isLoading={isLoading}
			onComplete={handleOnboardingComplete}
			user={
				user
					? {
							id: user.id,
							name: user.name || "",
							email: user.email || "",
							image: user.image,
							onboardingCompleted: user.onboardingCompleted,
						}
					: undefined
			}
		/>
	);
}
