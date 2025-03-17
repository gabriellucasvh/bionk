import Header from "@/components/Header";
import FormularioLogin from "./formulario-login";
import HeaderMobile from "@/components/HeaderMobile";
import Footer from "@/components/Footer";

export default function login() {
    return (
        <div>
            <Header />
            <HeaderMobile />
            <FormularioLogin />
            <Footer />
        </div>
    )
}