"use client";

import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { BaseButton } from "../buttons/BaseButton";
import { MotionDiv } from "../ui/motion";

const HeaderProps = [
	{ label: "Menu", href: "/" },
	{ label: "Templates", href: "/templates" },
	{ label: "Planos", href: "/planos" },
	{ label: "Descubra", href: "/descubra" },
	{ label: "Ajuda", href: "https://ajuda.bionk.me" },
];

const HeaderMobile = () => {
	const [isOpen, setIsOpen] = useState(false);
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
		<nav
			className={
				isOpen
					? "fixed inset-x-0 z-50 bg-white lg:hidden"
					: "fixed inset-x-0 z-50 bg-bunker-50/60 backdrop-blur-xl lg:hidden"
			}
		>
			<div
				className={
					isOpen
						? "pointer-events-none absolute inset-0 opacity-0"
						: "pointer-events-none absolute inset-0 bg-[length:6px_6px] bg-[radial-gradient(#000_0.5px,transparent_0.5px)] opacity-5"
				}
			/>
			<div className="relative m-3 flex items-center justify-between px-4 py-3 font-sans">
				<div>
					<Link href="/">
						<Image
							alt="logo"
							height={50}
							priority
							src="/images/bionk-name-logo.svg"
							width={100}
						/>
					</Link>
				</div>
				<button
					aria-expanded={isOpen ? "true" : "false"}
					aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
					className="relative h-7 w-8 select-none rounded-md focus:outline-none"
					onClick={() => setIsOpen(!isOpen)}
					type="button"
				>
					<span
						className={`absolute right-1 left-1 block h-0.5 transform bg-neutral-900 transition-all duration-300 ease-in-out dark:bg-white ${isOpen ? "top-3.5 rotate-45" : "top-2 rotate-0"}`}
					/>
					<span
						className={`absolute right-1 left-1 block h-0.5 transform bg-neutral-900 transition-all duration-300 ease-in-out dark:bg-white ${isOpen ? "scale-x-0 opacity-0" : "scale-100 opacity-100"} top-3.5`}
					/>
					<span
						className={`absolute right-1 left-1 block h-0.5 transform bg-neutral-900 transition-all duration-300 ease-in-out dark:bg-white ${isOpen ? "-rotate-45 top-3.5" : "top-5 rotate-0"}`}
					/>
				</button>
				<AnimatePresence>
					{isOpen && (
						<MotionDiv
							animate={{ opacity: 1, scaleY: 1 }}
							className="absolute top-full right-[-0.75rem] left-[-0.75rem] mt-3 w-[100vw] overflow-hidden bg-white p-4"
							exit={{ opacity: 0, scaleY: 0 }}
							initial={{ opacity: 0, scaleY: 0 }}
							style={{ transformOrigin: "top" }}
							transition={{ duration: 0.22 }}
						>
							<div className="relative flex flex-col space-y-2">
								{HeaderProps.map((menu) => (
									<MotionDiv
										animate={{ opacity: 1, x: 0 }}
										initial={{ opacity: 0, x: -10 }}
										key={menu.label}
										transition={{ delay: 0.1 }}
									>
										<Link
											className="block w-full rounded-md px-4 py-3 text-gray-700 text-semibold transition-colors duration-200 hover:text-black"
											href={menu.href}
										>
											{menu.label}
										</Link>
									</MotionDiv>
								))}
								<MotionDiv
									animate={{ opacity: 1, y: 0 }}
									className="mt-3 flex flex-col gap-4"
									initial={{ opacity: 0, y: 10 }}
									transition={{ delay: 0.2 }}
								>
									<div className="flex w-full justify-end gap-4 border-white/20 border-t pt-4">
										{session ? (
											<div className="flex w-full items-center justify-center gap-3">
												<BaseButton
													loading={isLoading[KEYS.studio]}
													onClick={() => handleClick("studio", routes.studio)}
												>
													Acessar o Studio
												</BaseButton>
											</div>
										) : (
											<div className="flex w-full items-center justify-center gap-3">
												<BaseButton
													loading={isLoading[KEYS.login]}
													onClick={() => handleClick("login", routes.login)}
													variant="white"
												>
													Entrar
												</BaseButton>
												<BaseButton
													loading={isLoading[KEYS.registro]}
													onClick={() =>
														handleClick("registro", routes.registro)
													}
												>
													Cadastre-se gratuitamente
												</BaseButton>
											</div>
										)}
									</div>
								</MotionDiv>
							</div>
						</MotionDiv>
					)}
				</AnimatePresence>
			</div>
		</nav>
	);
};

export default React.memo(HeaderMobile);
