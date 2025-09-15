"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SensitiveContentWarning from "@/components/SensitiveContentWarning";
import { LinkAnimationProvider } from "@/providers/linkAnimationProvider";
import type { UserProfile as UserProfileData } from "@/types/user-profile";

interface UserProfileWrapperProps {
	user: UserProfileData;
	children: React.ReactNode;
}

export function UserProfileWrapper({
	user,
	children,
}: UserProfileWrapperProps) {
	const [showWarning, setShowWarning] = useState(false);
	const router = useRouter();

	useEffect(() => {
		// Verifica se o perfil é sensível e se o usuário já aceitou o aviso
		if (user.sensitiveProfile) {
			const hasAcceptedWarning = sessionStorage.getItem(
				`sensitive-warning-${user.username}`
			);
			if (!hasAcceptedWarning) {
				setShowWarning(true);
			}
		}
	}, [user.sensitiveProfile, user.username]);

	const handleContinue = () => {
		// Salva a aceitação do aviso na sessão
		sessionStorage.setItem(`sensitive-warning-${user.username}`, "accepted");
		setShowWarning(false);
	};

	const handleGoBack = () => {
		// Volta para a página anterior ou home
		if (window.history.length > 1) {
			router.back();
		} else {
			router.push("/");
		}
	};

	if (showWarning) {
		return (
			<SensitiveContentWarning
				onContinue={handleContinue}
				onGoBack={handleGoBack}
			/>
		);
	}

	return (
		<LinkAnimationProvider>
			{children}
		</LinkAnimationProvider>
	);
}
