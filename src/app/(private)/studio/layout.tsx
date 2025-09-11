// app/(private)/studio/layout.tsx

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import LoadingPage from "@/components/layout/LoadingPage";
import { ThemeProvider } from "@/providers/themeProvider";
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
		}
	}, [status, router]);

	if (status === "loading") {
		return <LoadingPage />;
	}

	if (!session) {
		return null;
	}

	return (
		<ThemeProvider>
			<div className="flex min-h-screen bg-gray-50">
				{!isOnboardingPage && <Sidebar />}
				<main className={`flex-1 ${isOnboardingPage ? "" : "ml-64"}`}>
					{children}
				</main>
			</div>
		</ThemeProvider>
	);
}
