"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingPage from "@/components/layout/LoadingPage";

export default function Studio() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "authenticated" && session) {
			router.replace("/studio/perfil");
		}
	}, [status, session, router]);

	if (status === "loading") {
		return <LoadingPage />;
	}

	// O layout já cuida do redirect para /registro se não autenticado
	return <LoadingPage />;
}
