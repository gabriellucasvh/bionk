import Header from "@/components/Header";
import FormularioRegistro from "./formulario-registro";
import HeaderMobile from "@/components/HeaderMobile";
import Footer from "@/components/Footer";

export default function login() {
    return (
        <div>
            <Header />
            <HeaderMobile />
            <FormularioRegistro />
            <Footer />
        </div>
    )
}