import type { Metadata } from "next";
import PerfilClient from "./perfil.client";

export const metadata: Metadata = {
	title: "Bionk Perfil",
	description:
		"Edite seu perfil Bionk em poucos cliques. Compartilhe seu link único e comece a crescer hoje mesmo!",
};

export default function Perfil() {
	return (
	<main className="container bg-white dark:bg-neutral-800">
	<PerfilClient />
	</main>

	);
}
