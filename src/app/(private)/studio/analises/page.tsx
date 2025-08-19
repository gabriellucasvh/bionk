// app/analises/page.tsx

import { authOptions } from "@/lib/auth";
import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import Sidebar from "../Sidebar";
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
		<>
			<Sidebar />
			<main className="mb-20 ml-0 h-screen overflow-y-auto md:mb-0 md:ml-64">
				{userId ? (
					<AnalisesClient userId={userId} />
				) : (
					<section className="p-4">
						<p className="text-center font-medium text-lg">
							Você precisa estar autenticado para acessar esta página.
						</p>
					</section>
				)}
			</main>
		</>
	);
}
