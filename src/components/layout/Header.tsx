"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
		<nav className="fixed top-7 right-20 left-20 z-50 hidden h-auto items-center gap-y-4 rounded-3xl border bg-white px-6 py-4 lg:flex">
			<div className="mr-6 min-w-[100px] shrink-0">
				<Link href="/">
					<Image
						alt="logo"
						height={90}
						priority
						src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755641260/bionk-logo_sehkbi.svg"
						width={100}
					/>
				</Link>
			</div>

			<ul className="flex min-w-0 flex-1 flex-wrap">
				{HeaderProps.map((menu) => (
					<li key={menu.label}>
						<Link
							className="lack whitespace-nowrap rounded-md px-4 py-2 font-semibold text-gray-600 transition-colors duration-200 hover:bg-gray-200 hover:text-b"
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
						loading={isLoading[KEYS.studio]}
						onClick={() => handleClick("studio", routes.studio)}
					>
						Acessar seu Studio
					</BaseButton>
				) : (
					<>
						<BaseButton
							loading={isLoading[KEYS.login]}
							onClick={() => handleClick("login", routes.login)}
							variant="white"
						>
							Entrar
						</BaseButton>

						<BaseButton
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
