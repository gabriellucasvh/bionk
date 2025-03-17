import Header from "@/components/Header";
import FormularioRegistro from "./formulario-registro";
import HeaderMobile from "@/components/HeaderMobile";
import Footer from "@/components/Footer";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function login() {
        const session = await getServerSession()
    
        if(session) {
            return redirect('/dashboard')
        }
    return (
        <div>
            <Header />
            <HeaderMobile />
            <FormularioRegistro />
            <Footer />
        </div>
    )
}