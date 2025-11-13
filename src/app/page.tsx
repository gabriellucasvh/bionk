import dynamic from "next/dynamic";
import Header from "@/components/layout/Header";
import HeaderMobile from "@/components/layout/HeaderMobile";
import LoadingPage from "@/components/layout/LoadingPage";
import Hero from "./components/Hero";

const Features = dynamic(() => import("@/app/components/Features"), {
	loading: () => <LoadingPage />,
});
// const Testimonials = dynamic(() => import("@/app/components/Testimonials"), {
// 	loading: () => <LoadingPage />,
// });
const SocialConnect = dynamic(() => import("@/app/components/SocialConnect"), {
	loading: () => <LoadingPage />,
});
const EventsSection = dynamic(() => import("@/app/components/EventsSection"), {
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
			<SocialConnect />
			<EventsSection />
			{/* <Testimonials /> */}
			<CtaSection />
			<Footer />
		</main>
	);
}
