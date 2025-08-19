"use client";

import { AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BaseButton } from "../buttons/BaseButton";
import { MotionDiv } from "../ui/motion";

const HeaderProps = [
	{ label: "Menu", href: "/" },
	{ label: "Templates", href: "/templates" },
	{ label: "Planos", href: "/planos" },
	{ label: "Descubra", href: "/descubra" },
	{ label: "Ajuda", href: "/ajuda" },
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
		<nav className="fixed inset-x-0 z-50 m-3 flex max-w-full items-center justify-between rounded-xl border bg-white p-4 font-sans lg:hidden">
			<div>
				<Link href="/">
					<Image
						alt="logo"
						height={50}
						priority
						src="/bionk-logo.svg"
						width={100}
					/>
				</Link>
			</div>
			<button
				className="focus:outline-none"
				onClick={() => setIsOpen(!isOpen)}
				type="button"
			>
				{isOpen ? <X size={28} /> : <Menu size={28} />}
			</button>
			<AnimatePresence>
				{isOpen && (
					<MotionDiv
						animate={{ opacity: 1, y: 0 }}
						className="absolute top-full left-0 mt-1 flex w-full flex-col space-y-2 rounded-xl border bg-white p-4 shadow-md"
						exit={{ opacity: 0, y: -10 }}
						initial={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.3 }}
					>
						{HeaderProps.map((menu) => (
							<MotionDiv
								animate={{ opacity: 1, x: 0 }}
								initial={{ opacity: 0, x: -10 }}
								key={menu.label}
								transition={{ delay: 0.1 }}
							>
								<Link
									className="block w-full rounded-md px-4 py-2 text-gray-600 text-semibold transition-colors duration-200 hover:text-black active:bg-gray-200"
									href={menu.href}
								>
									{menu.label}
								</Link>
							</MotionDiv>
						))}
						<MotionDiv
							animate={{ opacity: 1, y: 0 }}
							className="mt-4 flex flex-col gap-4"
							initial={{ opacity: 0, y: 10 }}
							transition={{ delay: 0.2 }}
						>
							<div className="flex w-full justify-end gap-4 border-t pt-4">
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
											onClick={() => handleClick("registro", routes.registro)}
										>
											Cadastre-se gratuitamente
										</BaseButton>
									</div>
								)}
							</div>
						</MotionDiv>
					</MotionDiv>
				)}
			</AnimatePresence>
		</nav>
	);
};

export default HeaderMobile;
