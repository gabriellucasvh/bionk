import CtaSection from "./components/CtaSection";
import Features from "@/app/components/Features";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import HeaderMobile from "@/components/layout/HeaderMobile";
import Hero from "./components/Hero";
import Testimonials from "@/app/components/Testimonials";

export default function Home() {
  return (
    <main className="">
      <div className="">
        <Header />
        <HeaderMobile />
        <Hero />
        <Features />
        <Testimonials />
        <CtaSection />
        <Footer />
      </div>
    </main>
  );
}
