"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";

export default function RegistroErroPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [loading, setLoading] = useState(false);

	const clearClientData = useCallback(async () => {
		if (typeof window !== "undefined") {
			try {
				window.localStorage.clear();
			} catch {}
			try {
				window.sessionStorage.clear();
			} catch {}
			try {
				if ((window as any).cookieStore) {
					try {
						const items = await (window as any).cookieStore.getAll();
						const deletions = items.map((item: any) =>
							(window as any).cookieStore.delete({
								name: item.name,
								path: "/",
							})
						);
						await Promise.all(deletions);
					} catch {}
				}
			} catch {}
		}
	}, []);

	const cleanupRegistrationData = useCallback(async (email: string) => {
		try {
			await axios.post("/api/auth/cleanup-registration", { email });
		} catch {}
	}, []);

	const handleTryAgain = useCallback(async () => {
		setLoading(true);
		try {
			await clearClientData();

			const email = searchParams.get("email");
			if (email) {
				await cleanupRegistrationData(email);
			}

			router.push("/registro");
		} catch {
			router.push("/registro");
		} finally {
			setLoading(false);
		}
	}, [clearClientData, cleanupRegistrationData, searchParams, router]);

	return (
		<div className="flex min-h-screen">
			<div className="flex flex-1 items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
				<div className="w-full max-w-xl">
					<div className="space-y-7 text-center">
						<h1 className="font-bold text-4xl text-black">
							Ops! Não deu para concluir agora
						</h1>
						<div>
							<p className="text-base text-muted-foreground">
								Algo saiu do previsto. Vamos tentar novamente?
							</p>
							<p className="text-base text-muted-foreground">
								Se continuar acontecendo, entre em contato com o{" "}
								<Link className="underline" href="/contato">
									suporte
								</Link>{" "}
								que a gente resolve.
							</p>
						</div>
						<div className="flex flex-col items-center justify-center gap-4">
							<BaseButton
								className="w-1/2"
								disabled={loading}
								loading={loading}
								onClick={handleTryAgain}
							>
								Tentar novamente
							</BaseButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
