"use client";

import {
	Blend,
	ChartNoAxesCombined,
	Globe,
	PartyPopper,
	Plus,
	Rocket,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BaseButton } from "@/components/buttons/BaseButton";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import HeaderMobile from "@/components/layout/HeaderMobile";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { normalizeLocale } from "@/lib/i18n";

const getDict = (loc: "pt-br" | "en" | "es") => {
	const nloc = normalizeLocale(loc);
	return require(`@/dictionaries/public/${nloc}/descubra.ts`).default as any;
};

type FaqItem = { value: string; trigger: string; content: string };

const DescubraClient = ({ locale }: { locale: "pt-br" | "en" | "es" }) => {
	const router = useRouter();
	const dict = getDict(locale);
	const featureCardsLocal = [
		{
			icon: <Plus className="h-8 w-8 text-lime-300" />,
			title: dict.featureCards[0].title,
			desc: dict.featureCards[0].desc,
		},
		{
			icon: <Blend className="text-lime-300" />,
			title: dict.featureCards[1].title,
			desc: dict.featureCards[1].desc,
		},
		{
			icon: <PartyPopper className="text-lime-300" />,
			title: dict.featureCards[2].title,
			desc: dict.featureCards[2].desc,
		},
	];
	const analyticsFeaturesLocal = [
		{
			icon: (
				<ChartNoAxesCombined
					className="flex-shrink-0 p-4 text-white"
					size={50}
				/>
			),
			title: dict.analyticsFeatures[0].title,
			desc: dict.analyticsFeatures[0].desc,
		},
		{
			icon: <Rocket className="flex-shrink-0 p-4 text-white" size={50} />,
			title: dict.analyticsFeatures[1].title,
			desc: dict.analyticsFeatures[1].desc,
		},
		{
			icon: <Globe className="flex-shrink-0 p-4 text-white" size={50} />,
			title: dict.analyticsFeatures[2].title,
			desc: dict.analyticsFeatures[2].desc,
		},
	];
	const faqItemsLocal: FaqItem[] = dict.faq.map(
		(f: { trigger: string; content: string }, i: number) => ({
			value: `item-${i + 1}`,
			trigger: f.trigger,
			content: f.content,
		})
	);
	return (
		<div className="min-h-screen bg-sky-800">
			<Header locale={locale} />
			<HeaderMobile locale={locale} />
			<section className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 pt-10 text-lime-200 md:px-20 lg:flex-row lg:px-40">
				<div className="w-full space-y-4 pt-16 text-left lg:w-1/2 xl:pt-0">
					<h1 className="title text-4xl md:text-6xl">{dict.heroTitle}</h1>
					<p className="text-lg leading-tight md:text-2xl">
						{dict.heroSubtitle}
					</p>
					<BaseButton onClick={() => router.push("/registro")}>
						{dict.heroCTA}
					</BaseButton>
				</div>

				<div className="relative my-10 aspect-[4/3] w-full max-w-xs p-35 sm:max-w-md lg:max-w-lg">
					<Image
						alt="Instagram Logo"
						className="floating-logo"
						height={80}
						id="insta-logo"
						priority
						quality={100}
						sizes="(max-width: 640px) 40px, (max-width: 1024px) 60px, 80px"
						src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634934/Instagram_qekxxt.png"
						width={80}
					/>
					<Image
						alt="Snapchat Logo"
						className="floating-logo"
						height={90}
						id="snap-logo"
						priority
						quality={100}
						sizes="(max-width: 640px) 45px, (max-width: 1024px) 65px, 90px"
						src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634935/Snapchat_ppf2h5.png"
						width={90}
					/>
					<Image
						alt="Spotify Logo"
						className="floating-logo"
						height={70}
						id="spotify-logo"
						priority
						quality={100}
						sizes="(max-width: 640px) 35px, (max-width: 1024px) 55px, 70px"
						src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634936/Spotify_k5trud.png"
						width={70}
					/>
					<Image
						alt="TikTok Logo"
						className="floating-logo"
						height={85}
						id="tiktok-logo"
						priority
						quality={100}
						sizes="(max-width: 640px) 42px, (max-width: 1024px) 62px, 85px"
						src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634938/TikTok_uw2fqb.png"
						width={85}
					/>
					<Image
						alt="Whatsapp Logo"
						className="floating-logo"
						height={75}
						id="whatsapp-logo"
						priority
						quality={100}
						sizes="(max-width: 640px) 37px, (max-width: 1024px) 57px, 75px"
						src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634939/Whatsapp_cf7s6o.svg"
						width={75}
					/>
					<Image
						alt="Telegram Logo"
						className="floating-logo"
						height={80}
						id="telegram-logo"
						priority
						quality={100}
						sizes="(max-width: 640px) 40px, (max-width: 1024px) 60px, 80px"
						src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634937/Telegram_hlo0sb.png"
						width={80}
					/>
					<Image
						alt="YouTube Logo"
						className="floating-logo"
						height={90}
						id="youtube-logo"
						priority
						quality={100}
						sizes="(max-width: 640px) 45px, (max-width: 1024px) 65px, 90px"
						src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634940/YouTube_ect7zy.png"
						width={90}
					/>
					<Image
						alt="Twitch Logo"
						className="floating-logo"
						height={85}
						id="twitch-logo"
						priority
						quality={100}
						sizes="(max-width: 640px) 42px, (max-width: 1024px) 62px, 85px"
						src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634938/Twitch_hnd1ff.png"
						width={85}
					/>
					<Image
						alt="Facebook Logo"
						className="floating-logo"
						height={80}
						id="facebook-logo"
						priority
						quality={100}
						sizes="(max-width: 640px) 40px, (max-width: 1024px) 60px, 80px"
						src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634933/Facebook_awxfp5.png"
						width={80}
					/>
					<Image
						alt="Pinterest Logo"
						className="floating-logo"
						height={75}
						id="pinterest-logo"
						priority
						quality={100}
						sizes="(max-width: 640px) 37px, (max-width: 1024px) 57px, 75px"
						src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634934/Pinterest_o6vstp.png"
						width={75}
					/>
				</div>
			</section>

			<section className="flex min-h-screen w-full flex-col items-center justify-center space-y-8 rounded-t-3xl bg-white px-6 py-16 text-black md:px-20 lg:px-40">
				<div className="space-y-3 text-center">
					<h2 className="title text-3xl md:text-5xl">
						{dict.sectionSimpleTitle}
					</h2>
					<p className="font-medium text-muted-foreground">
						{dict.sectionSimpleSubtitle}
					</p>
				</div>
				<div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{featureCardsLocal.map((item) => (
						<Card className="border-2 border-sky-700" key={item.title}>
							<CardContent>
								<CardHeader className="my-5 flex h-14 w-14 items-center justify-center rounded-full bg-sky-600 p-4">
									{item.icon}
								</CardHeader>
								<CardTitle className="mb-6 font-semibold text-xl md:text-2xl">
									{item.title}
								</CardTitle>
								<CardDescription className="font-medium text-lg">
									{item.desc}
								</CardDescription>
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			<section className="flex min-h-screen w-full flex-col-reverse items-center justify-between gap-10 bg-cyan-950 px-6 py-16 text-sky-300 md:px-20 lg:flex-row lg:px-40">
				<div>
					<Image
						alt="Painel de Analytics da plataforma Bionk"
						className="w-full max-w-xs sm:max-w-md lg:max-w-lg"
						height={400}
						loading="lazy"
						quality={100}
						sizes="(max-width: 640px) 320px, (max-width: 1024px) 448px, 512px"
						src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634933/analytics_helc3k.png"
						width={400}
					/>
				</div>
				<div className="w-full text-center lg:w-1/2 lg:text-left">
					<h2 className="title mb-6 text-3xl text-white md:text-4xl">
						{dict.analyticsTitle}
					</h2>
					<p className="mb-8 font-medium text-white">
						{dict.analyticsSubtitle}
					</p>
					<div className="space-y-6">
						{analyticsFeaturesLocal.map((item) => (
							<div
								className="flex flex-col items-center gap-5 sm:flex-row"
								key={item.title}
							>
								<div className="rounded-full bg-cyan-400 p-2">{item.icon}</div>
								<div className="text-center sm:text-left">
									<h3 className="font-bold text-lg">{item.title}</h3>
									<p className="text-white">{item.desc}</p>
								</div>
							</div>
						))}
					</div>
					<div className="mt-8 flex justify-center lg:justify-start">
						<BaseButton onClick={() => router.push("/registro")}>
							{dict.heroCTA}
						</BaseButton>
					</div>
				</div>
			</section>

			<section className="flex min-h-screen w-full flex-col items-center justify-center gap-10 bg-white px-4 py-16 md:px-20 lg:px-40">
				<div className="w-full px-2 text-center md:px-0">
					<h2 className="title mb-6 text-3xl text-black md:text-4xl">
						{dict.faqTitle}
					</h2>
					<p className="mb-8 font-medium text-muted-foreground">
						{dict.faqSubtitle}
					</p>
				</div>
				<Card className="w-full border-none bg-transparent text-white shadow-none">
					<CardContent>
						<Accordion
							className="flex w-full flex-col items-center justify-center"
							collapsible
							type="single"
						>
							{faqItemsLocal.map((faq) => (
								<AccordionItem
									className="mb-4 w-full max-w-7xl rounded-3xl border-2 border-teal-800 bg-sky-900 px-6 py-6 transition-colors duration-300 hover:border-2 hover:border-lime-600 md:px-10"
									key={faq.value}
									value={faq.value}
								>
									<AccordionTrigger className="flex items-center text-left text-lg md:text-2xl">
										{faq.trigger}
									</AccordionTrigger>
									<AccordionContent className="text-sm md:text-lg">
										{faq.content}
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</CardContent>
				</Card>
			</section>

			<Footer locale={locale} />
		</div>
	);
};

export default DescubraClient;
