// app/dashboard/links/page.tsx

import type { Metadata } from "next";
import Sidebar from "../dashboard-sidebar";
import UnifiedLinksManager from "./components/UnifiedLinksManager";

export const metadata: Metadata = {
	title: "Bionk | Gerenciador de Links",
	description:
		"Adicione, organize e edite seus links de perfil e redes sociais em um só lugar. Uma experiência centralizada para máximo controle.",
};

export default function LinksPage() {
	return (
		<>
			<Sidebar />
			<main className="ml-0 md:ml-64 flex justify-center p-4 sm:p-6 md:p-8">
				<UnifiedLinksManager />
			</main>
		</>
	);
}