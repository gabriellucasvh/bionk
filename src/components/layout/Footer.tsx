"use client";

// Removido import dos ícones do Lucide - usando ícones SVG locais
import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";
import LanguageSwitcher from "./LanguageSwitcher";

type Locale = "pt-br" | "en" | "es";

const useFooterDict = (locale: Locale) => {
	const dict = useMemo(() => {
		if (locale === "en") {
			return {
				tagline: "Made for those who share what they love.",
				sections: {
					resources: "Resources",
					legal: "Legal",
					contact: "Contact",
				},
				nav: {
					help: "Help",
					discover: "Discover",
					templates: "Templates",
					plans: "Pricing & Plans",
					terms: "Terms & Conditions",
					privacy: "Privacy Policy",
					cookies: "Cookies",
					community: "Community Guidelines",
					report: "Report Violation",
					email: "contato@bionk.me",
					contact: "Contact",
				},
				copyright: `© ${new Date().getFullYear()} Bionk. All rights reserved.`,
			};
		}
		if (locale === "es") {
			return {
				tagline: "Creado para quienes comparten lo que aman.",
				sections: {
					resources: "Recursos",
					legal: "Legal",
					contact: "Contacto",
				},
				nav: {
					help: "Ayuda",
					discover: "Descubre",
					templates: "Plantillas",
					plans: "Precios y Planes",
					terms: "Términos y Condiciones",
					privacy: "Política de Privacidad",
					cookies: "Cookies",
					community: "Guías de la Comunidad",
					report: "Reportar Infracción",
					email: "contato@bionk.me",
					contact: "Contacto",
				},
				copyright: `© ${new Date().getFullYear()} Bionk. Todos los derechos reservados.`,
			};
		}
		return {
			tagline: "Criado para quem compartilha o que ama.",
			sections: { resources: "Recursos", legal: "Legal", contact: "Contato" },
			nav: {
				help: "Ajuda",
				discover: "Descubra",
				templates: "Templates",
				plans: "Preços e Planos",
				terms: "Termos e Condições",
				privacy: "Política de Privacidade",
				cookies: "Uso de Cookies",
				community: "Diretrizes da Comunidade",
				report: "Reportar Violação",
				email: "contato@bionk.me",
				contact: "Contato",
			},
			copyright: `© ${new Date().getFullYear()} Bionk. Todos os direitos reservados.`,
		};
	}, [locale]);
	const navigation = useMemo(
		() => ({
			resources: [
				{ name: dict.nav.help, href: "https://ajuda.bionk.me" },
				{ name: dict.nav.discover, href: "/descubra" },
				{ name: dict.nav.templates, href: "/templates" },
				{ name: dict.nav.plans, href: "/planos" },
			],
			contact: [
				{ name: dict.nav.contact, href: "/contato" },
				{ name: dict.nav.email, href: "mailto:contato@bionk.me" },
			],
			legal: [
				{ name: dict.nav.terms, href: "/termos" },
				{ name: dict.nav.privacy, href: "/privacidade" },
				{ name: dict.nav.cookies, href: "/cookies" },
				{ name: dict.nav.community, href: "/comunidade" },
				{ name: dict.nav.report, href: "/reportar-violacao" },
			],
			social: [
				{
					name: "Twitter",
					href: "#",
					icon: "/icons/x.svg",
				},
				{
					name: "Instagram",
					href: "#",
					icon: "/icons/instagram.svg",
				},
				{
					name: "Facebook",
					href: "#",
					icon: "/icons/facebook.svg",
				},
			],
		}),
		[dict]
	);
	return { dict, navigation };
};

const Footer = ({ locale = "pt-br" }: { locale?: Locale }) => {
	const { dict, navigation } = useFooterDict(locale);
	return (
		<footer className="w-full bg-bunker-950 text-bunker-300">
			<div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
				<div className="xl:grid xl:grid-cols-3 xl:gap-8">
					{/* Logo e descrição */}
					<div className="space-y-4">
						<Link className="inline-block" href="/">
							<Image
								alt="Bionk Logo"
								className="h-14 w-auto"
								height={28}
								priority
								src="/images/bionk-icon.svg"
								width={110}
							/>
						</Link>
						<p className="text-bunker-400 text-sm leading-6">{dict.tagline}</p>
					</div>

					{/* Links de navegação */}
					<div className="mt-12 grid grid-cols-1 gap-8 xl:col-span-2 xl:mt-0">
						<div className="md:grid md:grid-cols-3 md:gap-8">
							<div>
								<h3 className="font-black text-white text-xs uppercase tracking-wider">
									{dict.sections.resources}
								</h3>
								<ul className="mt-4 space-y-3">
									{navigation.resources.map((item) => (
										<li key={item.name}>
											<Link
												className="text-bunker-400 text-sm decoration-2 decoration-sky-400 transition-colors duration-300 hover:text-white hover:underline"
												href={item.href}
											>
												{item.name}
											</Link>
										</li>
									))}
								</ul>
							</div>
							<div className="mt-10 md:mt-0">
								<h3 className="font-black text-white text-xs uppercase tracking-wider">
									{dict.sections.legal}
								</h3>
								<ul className="mt-4 space-y-3">
									{navigation.legal.map((item) => (
										<li key={item.name}>
											<Link
												className="text-bunker-400 text-sm decoration-2 decoration-sky-400 transition-colors duration-300 hover:text-white hover:underline"
												href={item.href}
											>
												{item.name}
											</Link>
										</li>
									))}
								</ul>
							</div>
							<div className="mt-10 md:mt-0">
								<h3 className="font-black text-white text-xs uppercase tracking-wider">
									{dict.sections.contact}
								</h3>
								<ul className="mt-4 space-y-3">
									{navigation.contact.map((item) => (
										<li key={item.name}>
											<Link
												className="text-bunker-400 text-sm decoration-2 decoration-sky-400 transition-colors duration-300 hover:text-white hover:underline"
												href={item.href}
											>
												{item.name}
											</Link>
										</li>
									))}
								</ul>
							</div>
						</div>
						{/* Esta coluna pode ser usada para mais links no futuro, se necessário */}
					</div>
				</div>

				{/* Rodapé inferior com copyright e ícones sociais */}
				<div className="mt-16 border-bunker-800 border-t pt-8 sm:flex sm:items-center sm:justify-between">
					<div className="flex space-x-6 sm:order-2">
						{navigation.social.map((item) => (
							<Link
								aria-disabled={true}
								className="text-bunker-500 "
								href={item.href}
								key={item.name}
							>
								<span className="sr-only">{item.name}</span>
								<Image
									alt={item.name}
									className="h-5 w-5 opacity-60 brightness-0 invert filter transition-opacity duration-300 hover:opacity-100"
									height={20}
									src={item.icon}
									width={20}
								/>
							</Link>
						))}
					</div>
					<div className="flex items-center gap-4 sm:order-1 sm:mt-0">
						<LanguageSwitcher locale={locale} />
						<p className="text-bunker-500 text-xs leading-5">
							{dict.copyright}
						</p>
					</div>
				</div>
			</div>
			{/* <div className="mx-auto flex h-full w-full items-center justify-center p-4">
				<Image
					alt="Logo Bionk"
					height={1000}
					src={"/images/big-bionk-white.svg"}
					width={1000}
				/>
			</div> */}
		</footer>
	);
};

export default React.memo(Footer);
