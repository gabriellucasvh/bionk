"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type React from "react";
import { useState } from "react";
import { BaseButton } from "../buttons/BaseButton";

const HeaderProps = [
	{ label: "Menu", href: "/" },
	{ label: "Templates", href: "/templates" },
	{ label: "Planos", href: "/planos" },
	{ label: "Descubra", href: "/descubra" },
	{ label: "Ajuda", href: "/ajuda" },
];

const Header: React.FC = () => {
	const { data: session } = useSession();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});

	const handleClick = (key: string, path: string) => {
		if (isLoading[key]) return;
		setIsLoading((prev) => ({ ...prev, [key]: true }));
		router.push(path);
	};
	const routes = {
		dashboard: "/dashboard",
		login: "/login",
		registro: "/registro",
	};
	const KEYS = {
		dashboard: "dashboard",
		login: "login",
		registro: "registro",
	};

	return (
		<nav className="hidden lg:flex fixed inset-x-0 top-7 z-50 h-auto container mx-auto items-center px-4 sm:px-6 lg:px-8 py-4 rounded-xl bg-white border font-sans flex-wrap gap-y-4">
			<div className="mr-6 shrink-0 min-w-[160px]">
				<Link href="/">
					<Image
						src="/bionk-logo.svg"
						alt="logo"
						width={140}
						height={90}
						priority
					/>
				</Link>
			</div>

			<ul className="flex flex-wrap  min-w-0 flex-1">
				{HeaderProps.map((menu) => (
					<li key={menu.label}>
						<Link
							className="text-gray-600 hover:text-black transition-colors duration-200 px-4 py-2 rounded-md hover:bg-gray-200 font-semibold whitespace-nowrap"
							href={menu.href}
						>
							{menu.label}
						</Link>
					</li>
				))}
			</ul>

			<div className="flex flex-wrap justify-end gap-2 min-w-0">
				{session ? (
					<BaseButton
						onClick={() => handleClick("dashboard", routes.dashboard)}
						loading={isLoading[KEYS.dashboard]}
					>
						Acessar o Dashboard
					</BaseButton>
				) : (
					<>
						<BaseButton
							onClick={() => handleClick("login", routes.login)}
							variant="white"
							loading={isLoading[KEYS.login]}
						>
							Entrar
						</BaseButton>

						<BaseButton
							onClick={() => handleClick("registro", routes.registro)}
							loading={isLoading[KEYS.registro]}
						>
							Criar uma conta
						</BaseButton>
					</>
				)}
			</div>
		</nav>
	);
};

export default Header;
