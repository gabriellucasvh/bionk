import type { Metadata } from "next";
import PersonalizarClient from "./design.client";

export const metadata: Metadata = {
	title: "Bionk Design",
	description:
		"Edite seu perfil Bionk em poucos cliques. Compartilhe seu link único e comece a crescer hoje mesmo!",
};

export default function Perfil() {
	return (
		<main className="bg-zinc-100 dark:bg-zinc-800">
			<PersonalizarClient />
		</main>
	);
}
