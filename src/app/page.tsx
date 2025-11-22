import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import Header from "@/components/layout/Header";
import HeaderMobile from "@/components/layout/HeaderMobile";
import LoadingPage from "@/components/layout/LoadingPage";
import { normalizeLocale } from "@/lib/i18n";
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

export default async function Home() {
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get("locale")?.value || "pt-br";
	const locale = normalizeLocale(cookieLocale);
	return (
		<main>
			<Header locale={locale} />
			<HeaderMobile locale={locale} />
			<Hero locale={locale} />
			<Features locale={locale} />
			<SocialConnect locale={locale} />
			<EventsSection locale={locale} />
			{/* <Testimonials locale={locale} /> */}
			<CtaSection locale={locale} />
			<Footer locale={locale} />
		</main>
	);
}
