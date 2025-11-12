"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { BaseButton } from "../buttons/BaseButton";

const HeaderProps = [
	{ label: "Menu", href: "/" },
	{ label: "Templates", href: "/templates" },
	{ label: "Planos", href: "/planos" },
	{ label: "Descubra", href: "/descubra" },
	{ label: "Ajuda", href: "https://ajuda.bionk.me" },
];

const Header: React.FC = () => {
	const { data: session } = useSession();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});

	const handleClick = (key: string, path: string) => {
		if (isLoading[key]) {
			return;
		}
		setIsLoading((prev) => ({ ...prev, [key]: true }));
		router.push(path);
	};
	const routes = {
		studio: "/studio",
		login: "/login",
		registro: "/registro",
	};
	const KEYS = {
		studio: "studio",
		login: "login",
		registro: "registro",
	};

	return (
		<nav className="fixed inset-x-0 z-50 hidden bg-bunker-50/60 backdrop-blur-xl lg:block">
			<div className="pointer-events-none absolute inset-0 bg-[length:6px_6px] bg-[radial-gradient(#000_0.5px,transparent_0.5px)] opacity-5" />
			<div className="relative mx-auto flex h-auto max-w-7xl items-center gap-y-4 px-4 py-3">
				<div className="mx-3 min-w-[100px] shrink-0">
					<Link href="/">
						<Image
							alt="logo"
							className="h-6 w-auto"
							height={90}
							priority
							src="/images/bionk-name-logo.svg"
							width={100}
						/>
					</Link>
				</div>

				<ul className="flex min-w-0 flex-1 flex-wrap">
					{HeaderProps.map((menu) => (
						<li key={menu.label}>
							<Link
								className="font- whitespace-nowrap px-4 py-2 text-black transition-colors duration-200 hover:text-bunker-800"
								href={menu.href}
							>
								{menu.label}
							</Link>
						</li>
					))}
				</ul>

				<div className="flex min-w-0 flex-wrap justify-end gap-2">
					{session ? (
						<BaseButton
							className="h-14 bg-sky-300 text-black hover:bg-sky-400"
							loading={isLoading[KEYS.studio]}
							onClick={() => handleClick("studio", routes.studio)}
						>
							Acessar seu Studio
						</BaseButton>
					) : (
						<>
							<BaseButton
								className="h-14 bg-transparent hover:bg-transparent hover:text-bunker-800"
								loading={isLoading[KEYS.login]}
								onClick={() => handleClick("login", routes.login)}
							>
								Entrar
							</BaseButton>

							<BaseButton
								className="h-14 bg-sky-300 text-black hover:bg-sky-400"
								loading={isLoading[KEYS.registro]}
								onClick={() => handleClick("registro", routes.registro)}
							>
								Criar uma conta
							</BaseButton>
						</>
					)}
				</div>
			</div>
		</nav>
	);
};

export default React.memo(Header);
