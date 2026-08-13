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
	{ label: "Ajuda", href: "https://bionk.duckdns.org" },
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
		<nav className="fixed inset-x-0 z-50 hidden bg-white lg:block">
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
								className="whitespace-nowrap px-4 py-2 font-bold text-black transition-colors duration-200 hover:text-sky-500"
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
							className="h-12 rounded-full bg-sky-400 font-bold text-black hover:bg-sky-500"
							loading={isLoading[KEYS.studio]}
							onClick={() => handleClick("studio", routes.studio)}
						>
							Acessar seu Studio
						</BaseButton>
					) : (
						<>
							<BaseButton
								className="h-12 rounded-full bg-transparent font-bold text-black hover:bg-black/5"
								loading={isLoading[KEYS.login]}
								onClick={() => handleClick("login", routes.login)}
							>
								Entrar
							</BaseButton>

							<BaseButton
								className="h-12 rounded-full bg-sky-400 font-bold text-black hover:bg-sky-500"
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
