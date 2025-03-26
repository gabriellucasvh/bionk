import Header from "@/components/Header";
import FormularioLogin from "./formulario-login";
import HeaderMobile from "@/components/HeaderMobile";
import Footer from "@/components/Footer";
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export default async function login() {
    const session = await getServerSession()

    if (session) {
        return redirect('/dashboard')
    }
    return (
        <div>
            <FormularioLogin />
        </div>
    )
}