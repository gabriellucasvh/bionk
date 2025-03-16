import CtaSection from "@/components/CtaSection";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeaderMobile from "@/components/HeaderMobile";
import Hero from "@/components/Hero";
import Testimonials from "@/components/Testimonials";

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
