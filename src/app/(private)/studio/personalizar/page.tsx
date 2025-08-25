import type { Metadata } from "next";
import Sidebar from "../Sidebar";
import IframePreview from "./components/personalizar.IFramePreview";
import PersonalizarClient from "./personalizar.client";

export const metadata: Metadata = {
	title: "Bionk Personalizar",
	description:
		"Edite seu perfil Bionk em poucos cliques. Compartilhe seu link único e comece a crescer hoje mesmo!",
};

export default function Perfil() {
	return (
		<>
			<Sidebar />
			<main className="ml-0 flex md:ml-64 ">
				<PersonalizarClient />
				<div className="hidden xl:block">
					<IframePreview />
				</div>
			</main>
		</>
	);
}
