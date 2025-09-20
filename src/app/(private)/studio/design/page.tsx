import type { Metadata } from "next";
import IframePreview from "./components/design.IFramePreview";
import PersonalizarClient from "./design.client";

export const metadata: Metadata = {
	title: "Bionk Personalizar",
	description:
		"Edite seu perfil Bionk em poucos cliques. Compartilhe seu link único e comece a crescer hoje mesmo!",
};

export default function Perfil() {
	return (
		<main className="bg-white dark:bg-neutral-800">
			<PersonalizarClient />
			<div className="hidden xl:block">
				<IframePreview />
			</div>
		</main>
	);
}
