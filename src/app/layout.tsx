import NextAuthSessionProvider from "@/providers/sessionProvider";
import { SubscriptionProvider } from "@/providers/subscriptionProvider";
import type { Metadata } from "next";
import { Geist, Inter, Montserrat, Poppins, Nunito, Playfair_Display, Merriweather, Dancing_Script, DM_Serif_Display, Orbitron, Plus_Jakarta_Sans, Outfit, Space_Grotesk, Libre_Baskerville, Alegreya, Spectral, Urbanist, Karla, Public_Sans, Atkinson_Hyperlegible, Fira_Sans, Mulish } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const Satoshi = localFont({
	src: "/fonts/Satoshi-Variable.woff2",
	display: "swap",
	variable: "--font-satoshi",
});
const geist = Geist({
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
	subsets: ["latin"],
	variable: "--font-geist",
});
const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});
const montserrat = Montserrat({
	subsets: ["latin"],
	variable: "--font-montserrat",
});
const poppins = Poppins({
	weight: ["300", "400", "500", "600", "700"],
	subsets: ["latin"],
	variable: "--font-poppins",
});
const nunito = Nunito({
	subsets: ["latin"],
	variable: "--font-nunito",
});
const playfairDisplay = Playfair_Display({
	subsets: ["latin"],
	variable: "--font-playfair-display",
});
const merriweather = Merriweather({
	weight: ["300", "400", "700"],
	subsets: ["latin"],
	variable: "--font-merriweather",
});
const dancingScript = Dancing_Script({
	subsets: ["latin"],
	variable: "--font-dancing-script",
});
const dmSerifDisplay = DM_Serif_Display({
	weight: ["400"],
	subsets: ["latin"],
	variable: "--font-dm-serif-display",
});
const orbitron = Orbitron({
	subsets: ["latin"],
	variable: "--font-orbitron",
});
const plusJakartaSans = Plus_Jakarta_Sans({
	subsets: ["latin"],
	variable: "--font-plus-jakarta-sans",
});
const outfit = Outfit({
	subsets: ["latin"],
	variable: "--font-outfit",
});
const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-space-grotesk",
});
const libreBaskerville = Libre_Baskerville({
	weight: ["400", "700"],
	subsets: ["latin"],
	variable: "--font-libre-baskerville",
});
const alegreya = Alegreya({
	subsets: ["latin"],
	variable: "--font-alegreya",
});
const spectral = Spectral({
	weight: ["300", "400", "500", "600", "700"],
	subsets: ["latin"],
	variable: "--font-spectral",
});
const urbanist = Urbanist({
	subsets: ["latin"],
	variable: "--font-urbanist",
});
const karla = Karla({
	subsets: ["latin"],
	variable: "--font-karla",
});
const publicSans = Public_Sans({
	subsets: ["latin"],
	variable: "--font-public-sans",
});
const atkinsonHyperlegible = Atkinson_Hyperlegible({
	weight: ["400", "700"],
	subsets: ["latin"],
	variable: "--font-atkinson-hyperlegible",
});
const firaSans = Fira_Sans({
	weight: ["300", "400", "500", "600", "700"],
	subsets: ["latin"],
	variable: "--font-fira-sans",
});
const mulish = Mulish({
	subsets: ["latin"],
	variable: "--font-mulish",
});

export const metadata: Metadata = {
	title: "Bionk",
	description: "Reúna todos os seus links em um só lugar!",
	manifest: "/manifest.json",
	openGraph: {
		title: "Bionk",
		description: "Reúna todos os seus links em um só lugar!",
		url: "https://www.bionk.me",
		siteName: "Bionk",
		images: [
			{
				url: "https://www.bionk.me/bionk-opengraph.png",
				width: 1200,
				height: 630,
				alt: "Bionk",
			},
		],
		type: "website",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
			<html
				className={`${geist.variable} ${Satoshi.variable} ${inter.variable} ${montserrat.variable} ${poppins.variable} ${nunito.variable} ${playfairDisplay.variable} ${merriweather.variable} ${dancingScript.variable} ${dmSerifDisplay.variable} ${orbitron.variable} ${plusJakartaSans.variable} ${outfit.variable} ${spaceGrotesk.variable} ${libreBaskerville.variable} ${alegreya.variable} ${spectral.variable} ${urbanist.variable} ${karla.variable} ${publicSans.variable} ${atkinsonHyperlegible.variable} ${firaSans.variable} ${mulish.variable} antialiased`}
				lang="pt-BR" suppressHydrationWarning={true}
			>
			<body>
				<NextAuthSessionProvider>
					<SubscriptionProvider>{children}</SubscriptionProvider>
				</NextAuthSessionProvider>
			</body>
		</html>
	);
}
