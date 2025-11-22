"use client";

import { useMemo } from "react";

type Locale = "pt-br" | "en" | "es";

export const useHeaderLabels = (locale: Locale = "pt-br") => {
	const labels = useMemo(() => {
		if (locale === "en") {
			return {
				menu: "Home",
				templates: "Templates",
				plans: "Plans",
				discover: "Discover",
				help: "Help",
				studio: "Go to Studio",
				signIn: "Sign in",
				signUp: "Create an account",
				ariaOpen: "Close menu",
				ariaClosed: "Open menu",
			};
		}
		if (locale === "es") {
			return {
				menu: "Inicio",
				templates: "Plantillas",
				plans: "Planes",
				discover: "Descubre",
				help: "Ayuda",
				studio: "Acceder al Studio",
				signIn: "Entrar",
				signUp: "Crear una cuenta",
				ariaOpen: "Cerrar menú",
				ariaClosed: "Abrir menú",
			};
		}
		return {
			menu: "Menu",
			templates: "Templates",
			plans: "Planos",
			discover: "Descubra",
			help: "Ajuda",
			studio: "Acessar seu Studio",
			signIn: "Entrar",
			signUp: "Criar uma conta",
			ariaOpen: "Fechar menu",
			ariaClosed: "Abrir menu",
		};
	}, [locale]);
	const items = useMemo(
		() => [
			{ label: labels.menu, href: "/" },
			{ label: labels.templates, href: "/templates" },
			{ label: labels.plans, href: "/planos" },
			{ label: labels.discover, href: "/descubra" },
			{ label: labels.help, href: "https://ajuda.bionk.me" },
		],
		[labels]
	);
	return { labels, items };
};
