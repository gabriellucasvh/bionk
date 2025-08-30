// app/(private)/studio/layout.tsx

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
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
			<section>
				<Sidebar />
				<main className="mb-20 ml-0 min-h-screen md:mb-0 md:ml-64">
					{children}
				</main>
			</section>
		);
}
