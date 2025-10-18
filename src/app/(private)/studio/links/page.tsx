// app/studio/links/page.tsx

import type { Metadata } from "next";
import LinksStudioClient from "./links.client";

export const metadata: Metadata = {
	title: "Bionk Links",
	description:
		"Adicione, organize e edite seus links de perfil e redes sociais em um só lugar. Uma experiência centralizada para máximo controle.",
};

export default function LinksPage() {
	return (
		<div className="bg-white dark:bg-neutral-800">
			<LinksStudioClient />
		</div>
	);
}
