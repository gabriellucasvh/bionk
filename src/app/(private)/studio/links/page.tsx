// app/studio/links/page.tsx

import type { Metadata } from "next";
import UnifiedLinksManager from "./components/links.UnifiedLinksManager";

export const metadata: Metadata = {
	title: "Bionk Links",
	description:
		"Adicione, organize e edite seus links de perfil e redes sociais em um só lugar. Uma experiência centralizada para máximo controle.",
};

export default function LinksPage() {
	return (
			<div className="bg-white p-4 pb-24 sm:p-6 sm:pb-8 md:p-8 md:pb-8 dark:bg-neutral-800">
			<UnifiedLinksManager />
		</div>
	);
}
