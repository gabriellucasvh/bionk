import type { Metadata } from "next";
import HeaderBack from "@/components/layout/HeaderBack";
import FormularioLogin from "./formulario-login";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Bionk | Login",
    description: "Acesse sua conta Bionk para gerenciar seus links, personalizar sua página e acompanhar seus resultados. Rápido, seguro e intuitivo!",
};

export default async function login() {
    const session = await getServerSession()

    if (session) {
        return redirect('/dashboard')
    }
    return (
        <div>
            <HeaderBack />
            <FormularioLogin />
        </div>
    )
}