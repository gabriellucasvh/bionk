import type { Metadata } from "next";
import Sidebar from "../dashboard-sidebar";
import LinksClient from "./links.client";
import SocialLinksClient from "./links.SocialLinksClient";

export const metadata: Metadata = {
	title: "Bionk Links",
	description:
		"Visualize e edite todos seus links em um só lugar. Acompanhe desempenho, organize e atualize em tempo real!",
};

export default function links() {
	return (
		<>
			<Sidebar />
			<main className="flex flex-col-reverse lg:flex-row ml-0 md:ml-64 mb-20 md:mb-0 ">
				<LinksClient />
				<SocialLinksClient />
			</main>
		</>
	);
}
