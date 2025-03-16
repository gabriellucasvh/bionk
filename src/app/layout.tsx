import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { Geist } from "next/font/google"
import Footer from "@/components/Footer";
import localFont from "next/font/local"

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
    <html lang="pt-BR" className={`${geist.variable} ${baithe.variable} antialiased bg-green-400`}>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
