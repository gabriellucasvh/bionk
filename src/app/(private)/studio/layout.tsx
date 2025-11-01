// app/(private)/studio/layout.tsx

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import LoadingPage from "@/components/layout/LoadingPage";
import Sidebar from "./Sidebar";

interface StudioLayoutProps {
	children: React.ReactNode;
}

export default function StudioLayout({ children }: StudioLayoutProps) {
	const { data: session, status } = useSession();
	const router = useRouter();
	const pathname = usePathname();
	const isOnboardingPage = pathname.includes("/onboarding");

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/registro");
			return;
		}

		// Verificar se o usuário está banido
		if (status === "authenticated" && session?.user?.isBanned) {
			router.push("/acesso-negado");
			return;
		}
	}, [status, session, router]);

	if (status === "loading") {
		return <LoadingPage />;
	}

	if (!session) {
		return <LoadingPage />;
	}

	return (
		<div className="flex min-h-screen w-full max-w-full overflow-x-hidden bg-gray-50">
			{!isOnboardingPage && <Sidebar />}
			<main
				className={`w-full max-w-full flex-1 overflow-x-hidden ${isOnboardingPage ? "" : "md:ml-64"}`}
			>
				{children}
			</main>
		</div>
	);
}
