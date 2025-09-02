import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

export const metadata: Metadata = {
	title: "Bionk | Cadastro",
	description:
		"Cadastre-se gratuitamente na Bionk e crie sua página de links poderosa. Personalização total, analytics e fácil integração - comece agora!",
};

export default async function registro() {
	const session = await getServerSession();

	if (session) {
		return redirect("/studio");
	}
	
	// Redirecionar para a primeira etapa do registro
	return redirect("/registro/email");
}
