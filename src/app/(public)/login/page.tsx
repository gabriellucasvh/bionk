import HeaderBack from "@/components/HeaderBack";
import FormularioLogin from "./formulario-login";
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

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