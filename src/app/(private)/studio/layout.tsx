// app/(private)/studio/layout.tsx

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

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
			<main>{children}</main>
		</section>
	);
}
