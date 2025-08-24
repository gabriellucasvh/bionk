import Header from "@/components/layout/Header";
import HeaderMobile from "@/components/layout/HeaderMobile";
import LoadingPage from "@/components/layout/LoadingPage";
import dynamic from "next/dynamic";
import Hero from "./components/Hero";

const Features = dynamic(() => import("@/app/components/Features"), {
	loading: () => <LoadingPage />,
});
const Testimonials = dynamic(() => import("@/app/components/Testimonials"), {
	loading: () => <LoadingPage />,
});
const CtaSection = dynamic(() => import("./components/CtaSection"), {
	loading: () => <LoadingPage />,
});
const Footer = dynamic(() => import("@/components/layout/Footer"), {
	loading: () => <LoadingPage />,
});

export default function Home() {
	return (
		<main>
			<Header />
			<HeaderMobile />
			<Hero />
			<Features />
			<Testimonials />
			<CtaSection />
			<Footer />
		</main>
	);
}
