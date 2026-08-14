"use client";

import { useSession } from "next-auth/react";
import LoadingPage from "@/components/layout/LoadingPage";

export default function Studio() {
	const { status } = useSession();

	if (status === "loading") {
		return <LoadingPage />;
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<h1 className="text-2xl font-bold text-zinc-500">Studio</h1>
		</div>
	);
}
