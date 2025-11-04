// app/analises/page.tsx

import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import AnalisesClient from "./analises.client";

export const metadata: Metadata = {
	title: "Bionk Análises",
	description:
		"Acompanhe cliques, tráfego e engajamento em tempo real. Transforme dados em estratégia com os dashboards mais completos para Links in Bio!",
};

export default async function Analises() {
	const session = await getServerSession(authOptions);
	const userId = session?.user?.id;

	return (
		<main className="bg-zinc-100 dark:bg-zinc-800">
			{userId ? (
				<AnalisesClient userId={userId} />
			) : (
				<section className="p-4 pb-24">
					<p className="text-center font-medium text-lg">
						Você precisa estar autenticado para acessar esta página.
					</p>
				</section>
			)}
		</main>
	);
}
