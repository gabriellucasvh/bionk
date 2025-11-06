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
		<nav className="fixed top-7 right-4 left-4 z-50 mx-auto hidden h-auto max-w-7xl items-center gap-y-4 rounded-full border bg-white px-4 py-3 lg:flex xl:inset-x-0">
			<div className="mr-6 min-w-[100px] shrink-0">
				<Link href="/">
					<Image
						alt="logo"
						height={90}
						priority
						src="/images/svg-bionk+oct.svg"
						width={100}
					/>
				</Link>
			</div>

			<ul className="flex min-w-0 flex-1 flex-wrap">
				{HeaderProps.map((menu) => (
					<li key={menu.label}>
						<Link
							className="whitespace-nowrap rounded-md px-4 py-2 font-semibold text-black transition-colors duration-200 hover:text-purple-600"
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
						className="h-14"
						loading={isLoading[KEYS.studio]}
						onClick={() => handleClick("studio", routes.studio)}
					>
						Acessar seu Studio
					</BaseButton>
				) : (
					<>
						<BaseButton
							className="h-14"
							loading={isLoading[KEYS.login]}
							onClick={() => handleClick("login", routes.login)}
							variant="white"
						>
							Entrar
						</BaseButton>

						<BaseButton
							className="h-14"
							loading={isLoading[KEYS.registro]}
							onClick={() => handleClick("registro", routes.registro)}
						>
							Criar uma conta
						</BaseButton>
					</>
				)}
			</div>
		</nav>
	);
};

export default React.memo(Header);
