// app/dashboard/links/page.tsx

import type { Metadata } from "next";
import Sidebar from "../dashboard.sidebar";
import UnifiedLinksManager from "./components/links.UnifiedLinksManager";

export const metadata: Metadata = {
	title: "Bionk | Gerenciador de Links",
	description:
		"Adicione, organize e edite seus links de perfil e redes sociais em um só lugar. Uma experiência centralizada para máximo controle.",
};

export default function LinksPage() {
	return (
		<>
			<Sidebar />
			<main className="ml-0 flex justify-start p-4 sm:p-6 md:ml-64 md:p-8">
				<UnifiedLinksManager />
			</main>
		</>
	);
}
