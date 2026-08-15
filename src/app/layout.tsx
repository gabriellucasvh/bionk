import type { Metadata, Viewport } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import { LinkAnimationProvider } from "@/providers/linkAnimationProvider";
import NextAuthSessionProvider from "@/providers/sessionProvider";
import { SubscriptionProvider } from "@/providers/subscriptionProvider";
import { ThemeProvider } from "@/providers/themeProvider";
import "./globals.css";

const Satoshi = localFont({
	src: "/fonts/Satoshi-Variable.woff2",
	display: "swap",
	variable: "--font-satoshi",
});

const ClashDisplay = localFont({
	src: "/fonts/ClashDisplay-Variable.woff2",
	display: "swap",
	variable: "--font-clash-display",
});

const cabinetGrotesk = localFont({
	src: "/fonts/CabinetGrotesk-Variable.woff2",
	display: "swap",
	variable: "--font-cabinet-grotesk",
});

const geist = Geist({
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
	subsets: ["latin"],
	variable: "--font-geist",
});

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
};

export const metadata: Metadata = {
	title: "Bionk",
	description: "Reúna todos os seus links em um só lugar!",
	manifest: "/manifest.json",
	openGraph: {
		title: "Bionk",
		description: "Reúna todos os seus links em um só lugar!",
		url: "https://bionk.duckdns.org",
		siteName: "Bionk",
		images: [
			{
				url: "https://bionk.duckdns.org/bionk-opengraph.png",
				width: 1200,
				height: 630,
				alt: "Bionk",
			},
		],
		type: "website",
	},
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await getServerSession(authOptions);
    return (
        <html
            className={`${geist.variable} ${ClashDisplay.variable} ${cabinetGrotesk.variable} ${Satoshi.variable} antialiased`}
            data-scroll-behavior="smooth"
            lang="pt-BR"
            suppressHydrationWarning={true}
        >
            <body>
                <NextAuthSessionProvider session={session}>
                    <SubscriptionProvider>
                        <LinkAnimationProvider>
                            <ThemeProvider>{children}</ThemeProvider>
                        </LinkAnimationProvider>
                    </SubscriptionProvider>
                </NextAuthSessionProvider>
            </body>
        </html>
    );
}
