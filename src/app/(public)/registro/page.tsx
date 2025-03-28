import type { Metadata } from "next";
import FormularioRegistro from "./formulario-registro";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import HeaderBack from "@/components/HeaderBack";

export const metadata: Metadata = {
    title: "Bionk | Cadastro",
    description: "Cadastre-se gratuitamente na Bionk e crie sua página de links poderosa. Personalização total, analytics e fácil integração - comece agora!",
};

export default async function registro() {
    const session = await getServerSession()

    if (session) {
        return redirect('/dashboard')
    }
    return (
        <div>
            <HeaderBack />
            <FormularioRegistro />
        </div>
    )
}