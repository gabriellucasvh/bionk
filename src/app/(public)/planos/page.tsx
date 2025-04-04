import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import PricingPage from "./prices";
import Footer from "@/components/layout/Footer";
import HeaderMobile from "@/components/layout/HeaderMobile";

export const metadata: Metadata = {
    title: "Bionk | Planos",
    description: "Compare os planos da Bionk e encontre o perfeito para você! Recursos exclusivos, analytics avançados e customização total. Comece agora!",
};

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