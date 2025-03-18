import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google"
import localFont from "next/font/local"
import NextAuthSessionProvider from "@/providers/sessionProvider";

const baithe = localFont({
  src: "/fonts/baithe.otf",
  display: "swap",
  variable: "--font-baithe"
})
const geist = Geist({
  weight: ["100", "200", "300","400","500","600","700","800","900"],
  subsets: ['latin'],
  variable: '--font-geist',
})

export const metadata: Metadata = {
  title: "Bionk",
  description: "Crie o melhor organizador de links para o seu negócio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geist.variable} ${baithe.variable} antialiased`}>
      <body>
        <NextAuthSessionProvider>
          {children}
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
