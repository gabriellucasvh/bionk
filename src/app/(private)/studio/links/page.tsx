// app/studio/links/page.tsx

import type { Metadata } from "next";
import UnifiedLinksManager from "./components/links.UnifiedLinksManager";

export const metadata: Metadata = {
	title: "Bionk | Gerenciador de Links",
	description:
		"Adicione, organize e edite seus links de perfil e redes sociais em um só lugar. Uma experiência centralizada para máximo controle.",
};

export default function LinksPage() {
	return (
		<div className="p-4 sm:p-6 md:p-8">
			<UnifiedLinksManager />
		</div>
	);
}
