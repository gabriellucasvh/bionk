import Header from "@/components/Header";
import PricingPage from "./prices";
import Footer from "@/components/Footer";
import HeaderMobile from "@/components/HeaderMobile";

export default function planos() {
    return (
        <div>
            <Header />
            <HeaderMobile />
            <PricingPage />
            <Footer />
        </div>
    )
}