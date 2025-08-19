import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import FormularioLogin from "./formulario-login";

export const metadata: Metadata = {
	title: "Bionk | Login",
	description:
		"Acesse sua conta Bionk para gerenciar seus links, personalizar sua página e acompanhar seus resultados. Rápido, seguro e intuitivo!",
};

export default async function login() {
	const session = await getServerSession();

	if (session) {
		return redirect("/studio");
	}
	return <FormularioLogin />;
}
