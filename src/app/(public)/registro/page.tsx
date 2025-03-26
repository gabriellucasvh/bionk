import FormularioRegistro from "./formulario-registro";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function login() {
    const session = await getServerSession()

    if (session) {
        return redirect('/dashboard')
    }
    return (
        <div>
            <FormularioRegistro />
        </div>
    )
}