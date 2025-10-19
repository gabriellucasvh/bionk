"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BannedUserWarning from "@/components/BannedUserWarning";
// Removido: ProfileViewTracker para evitar duplicidade (já é usado no BaseTemplate)
// import ProfileViewTracker from "@/components/ProfileViewTracker";
// Removido: LinkAnimationProvider (já está no layout global)
// import { LinkAnimationProvider } from "@/providers/linkAnimationProvider";
import SensitiveContentWarning from "@/components/SensitiveContentWarning";
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

	// Verificar se o usuário está banido primeiro
	if (user.isBanned) {
		return (
			<BannedUserWarning
				bannedAt={user.bannedAt}
				banReason={user.banReason}
				username={user.username}
			/>
		);
	}

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
		// Removido LinkAnimationProvider para evitar montagem duplicada
		<>{children}</>
	);
}
