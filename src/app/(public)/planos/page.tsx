import Header from "@/components/Header";
import PricingPage from "./prices";
import Footer from "@/components/Footer";
import { div } from "framer-motion/client";

export default function planos() {
    return (
        <div>
            <Header />
            <PricingPage />
            <Footer />
        </div>
    )
}