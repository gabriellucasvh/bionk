import type { Metadata } from "next";
import DescubraClient from "./descubra.client";

export const metadata: Metadata = {
	title: "Bionk | Descubra",
	description:
		"Descubra a Bionk: a plataforma de Link in Bio que simplifica sua presença online. Crie páginas incríveis, monitore resultados e conecte seu público com estilo!",
};

const Descubra = () => {
	return (
		<div>
			<DescubraClient />
		</div>
	);
};

export default Descubra;
