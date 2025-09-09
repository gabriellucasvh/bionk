// app/(private)/studio/layout.tsx

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { SubscriptionSuccessHandler } from "@/components/SubscriptionSuccessHandler";
import { ThemeProvider } from "@/providers/themeProvider";
import Sidebar from "./Sidebar";

interface StudioLayoutProps {
	children: ReactNode;
}

export default async function StudioLayout({ children }: StudioLayoutProps) {
	const session = await getServerSession();

	if (!session) {
		redirect("/login");
	}

	return (
		<ThemeProvider>
			<section className="min-h-screen bg-white transition-colors dark:bg-neutral-900">
				<Suspense fallback={null}>
					<SubscriptionSuccessHandler />
				</Suspense>
				<Sidebar />
				<main className="mb-20 ml-0 min-h-screen bg-white transition-colors md:mb-0 md:ml-64 dark:bg-neutral-900">
					{children}
				</main>
			</section>
		</ThemeProvider>
	);
}
