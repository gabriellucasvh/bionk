import type { Metadata } from "next";
import ConfigsClient from "./configs.client";

export const metadata: Metadata = {
	title: "Bionk Configurações",
	description:
		"Ajuste preferências, segurança e notificações da sua conta Bionk. Tudo organizado para você configurar em poucos cliques!",
};

export default function links() {
	return <ConfigsClient />;
}
