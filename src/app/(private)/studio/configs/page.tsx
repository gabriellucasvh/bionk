import type { Metadata } from "next";
import ConfigsClient from "./configs.client";

export const metadata: Metadata = {
	title: "Bionk Configurações",
	description:
		"Ajuste preferências, segurança e notificações da sua conta Bionk. Tudo organizado para você configurar em poucos cliques!",
};

export default function links() {
	return (
		<main className="h-full w-full bg-white dark:bg-neutral-800">
			<ConfigsClient />
		</main>
	);
}
