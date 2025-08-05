"use client";

import { AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
		<nav className="flex lg:hidden fixed inset-x-0 z-50 m-3 max-w-full items-center justify-between p-4 rounded-xl bg-white border font-sans">
			<div>
				<Link href="/">
					<Image src="/bionk-logo.svg" alt="logo" width={100} height={50} priority/>
				</Link>
			</div>
			<button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none" type="button">
				{isOpen ? <X size={28} /> : <Menu size={28} />}
			</button>
			<AnimatePresence>
				{isOpen && (
					<MotionDiv
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.3 }}
						className="absolute top-full mt-1 rounded-xl left-0 w-full flex flex-col p-4 space-y-2 bg-white shadow-md border"
					>
						{HeaderProps.map((menu) => (
							<MotionDiv
								key={menu.label}
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.1 }}
							>
								<Link
									href={menu.href}
									className="block w-full text-gray-600 hover:text-black transition-colors duration-200 px-4 py-2 rounded-md active:bg-gray-200 text-semibold"
								>
									{menu.label}
								</Link>
							</MotionDiv>
						))}
						<MotionDiv
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
							className="flex flex-col gap-4 mt-4"
						>
							<div className="flex w-full justify-end gap-4 border-t pt-4">
								{session ? (
									<div className="flex items-center w-full justify-center gap-3">
										<BaseButton
											onClick={() => handleClick("dashboard", routes.dashboard)}
											loading={isLoading[KEYS.dashboard]}
										>
											Acessar o Dashboard
										</BaseButton>
									</div>
								) : (
									<div className="flex items-center w-full justify-center gap-3">
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
