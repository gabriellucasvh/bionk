import type { Metadata } from "next";
import Sidebar from "../dashboard.sidebar";
import ConfigsClient from "./configs.client";

export const metadata: Metadata = {
	title: "Bionk Configurações",
	description:
		"Ajuste preferências, segurança e notificações da sua conta Bionk. Tudo organizado para você configurar em poucos cliques!",
};

export default function links() {
	return (
		<>
			<Sidebar />
			<main className="mb-20 ml-0 h-screen overflow-y-auto md:mb-0 md:ml-64">
				<ConfigsClient />
			</main>
		</>
	);
}
