"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	BarChart3,
	Blocks,
	ExternalLink,
	Link2,
	LogOut,
	Paintbrush,
	Settings,
	ShoppingBag,
	SwatchBook,
	Table2,
	User,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const mainLinks = [
	{
		key: "profile",
		href: "/studio/perfil",
		label: "Perfil",
		icon: <User className="h-4 w-4" />,
	},
	{
		key: "links",
		href: "/studio/links",
		label: "Links",
		icon: <Link2 className="h-4 w-4" />,
	},
	{
		key: "personalization",
		href: "/studio/personalizar",
		label: "Temas",
		icon: <Paintbrush className="h-4 w-4" />,
	},
	{
		key: "analytics",
		href: "/studio/analises",
		label: "Análises",
		icon: <BarChart3 className="h-4 w-4" />,
	},
	{
		key: "settings",
		href: "/studio/configs",
		label: "Configurações",
		labelMobile: "Configs.",
		icon: <Settings className="h-4 w-4" />,
	},
];

const toolsLinks = [
	{
		key: "shop",
		href: "/studio/links-shop",
		label: "Links Shop",
		icon: <ShoppingBag className="h-4 w-4" />,
	},
	{
		key: "creators",
		href: "/studio/criadores",
		label: "Para Criadores",
		icon: <SwatchBook className="h-4 w-4" />,
	},
	{
		key: "integrations",
		href: "/studio/integracoes",
		label: "Integrações",
		icon: <Blocks className="h-4 w-4" />,
	},
];

const Sidebar = () => {
	const pathname = usePathname();
	const router = useRouter();
	const { data: session } = useSession();
	const [disabledButtons, setDisabledButtons] = useState<Set<string>>(
		() => new Set()
	);
	const [profileUrl, setProfileUrl] = useState<string>("#");
	const handleLogout = () => signOut();

	const username = session?.user?.username;

	useEffect(() => {
		const baseUrl =
			process.env.NODE_ENV === "production"
				? "https://www.bionk.me"
				: "http://localhost:3000";
		setProfileUrl(username ? `${baseUrl}/${username}` : "#");
	}, [username]);

	useEffect(() => {
		setDisabledButtons(new Set());
	}, []);
	const isLoading = !(session?.user && username);
	return (
		<>
			{/* Sidebar para telas médias e maiores */}
			<aside className="hidden px-2 md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col md:border-r md:bg-card/40">
				<header className="flex h-16 items-center border-b pl-2">
					<Link
						className="flex items-center justify-center gap-2 font-semibold"
						href="/"
					>
						<Image
							alt="logo"
							height={30}
							priority
							src="/bionk-logo.svg"
							width={90}
						/>
					</Link>
				</header>

				<div className="flex max-w-full flex-row">
					<div className="mt-4 mb-2 flex items-center justify-center">
						<div>
							{isLoading ? (
								<Skeleton className="h-12 w-12 rounded-full" />
							) : (
								<Image
									alt="Avatar"
									className="rounded-full"
									height={48}
									src={session.user.image || "/default-avatar.png"}
									width={48}
								/>
							)}
						</div>

						<div className="ml-3 flex flex-col items-start">
							{isLoading ? (
								<Skeleton className="mb-1 h-4 w-10 rounded-sm" />
							) : (
								<span className="mt-1 inline-flex items-center rounded-sm bg-green-100 px-2 py-0.5 font-medium text-[10px] text-green-500">
									Free
								</span>
							)}

							{isLoading ? (
								<>
									<Skeleton className="mb-1 h-4 w-40" />
									<Skeleton className="h-3 w-32" />
								</>
							) : (
								<>
									<h2 className="w-40 overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-sm">
										{session.user.name}
									</h2>
									<p className="w-40 overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground text-xs">
										bionk.me/{username}
									</p>
								</>
							)}
						</div>
					</div>
				</div>
				<div className="py-2">
					<Link
						className="flex h-10 w-full items-center justify-start gap-2 rounded-md px-4 font-medium text-sm transition-colors duration-300 hover:bg-green-500 hover:text-white"
						href={profileUrl}
						rel="noopener noreferrer"
						target="_blank"
					>
						<Table2 className="h-4 w-4" />
						<span className="flex w-full items-center justify-between">
							Ver meu perfil
							<ExternalLink className="h-4 w-4" />
						</span>
					</Link>
				</div>

				<nav className="space-y-1">
					{mainLinks.map((link) => {
						const isActive = pathname === link.href;
						return (
							<Button
								className={`h-10 w-full justify-start font-medium text-sm transition-colors duration-200 hover:bg-gray-200 ${isActive ? "border-gray-200 bg-gray-200" : ""}`}
								disabled={disabledButtons.has(link.key)}
								key={link.key}
								onClick={() => {
									if (isActive) {
										return;
									}
									setDisabledButtons((prev) => new Set(prev).add(link.key));
									router.push(`${link.href}`);
								}}
								variant={isActive ? "secondary" : "ghost"}
							>
								<span className="mr-3">{link.icon}</span>
								{link.label}
							</Button>
						);
					})}
				</nav>

				{/* Seção Ferramentas */}
				<div className="mt-4">
					<h3 className="mb-2 px-4 font-semibold text-muted-foreground text-xs tracking-wider">
						Ferramentas
					</h3>
					<nav className="space-y-1">
						{toolsLinks.map((link) => {
							const isActive = pathname === link.href;
							return (
								<Button
									className={`h-10 w-full justify-start font-medium text-sm transition-colors duration-200 hover:bg-gray-200 ${isActive ? "border-gray-200 bg-gray-200" : ""}`}
									disabled={disabledButtons.has(link.key)}
									key={link.key}
									onClick={() => {
										if (isActive) {
											return;
										}
										setDisabledButtons((prev) => new Set(prev).add(link.key));
										router.push(`${link.href}`);
									}}
									variant={isActive ? "secondary" : "ghost"}
								>
									<span className="mr-3">{link.icon}</span>
									{link.label}
								</Button>
							);
						})}
					</nav>
				</div>

				<div className="mt-auto space-y-2 border-t p-4">
					<Button
						className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
						onClick={handleLogout}
						size="sm"
						variant="ghost"
					>
						<LogOut className="mr-3 h-4 w-4" />
						Sair
					</Button>
				</div>
			</aside>

			{/* Menu fixo para mobile com ícones */}
			<nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-white md:hidden">
				<ul className="grid grid-cols-5 divide-x divide-muted py-3">
					{mainLinks.map((link) => {
						// Alterado para mainLinks para não incluir as ferramentas no mobile
						const isActive = pathname === link.href;
						return (
							<li className="flex items-center justify-center" key={link.key}>
								<Button
									className={`flex flex-col items-center justify-center gap-1 px-1 text-[10px] sm:text-xs ${
										isActive ? "text-foreground" : "text-muted-foreground"
									}`}
									disabled={disabledButtons.has(link.key)}
									onClick={() => {
										if (isActive) {
											return;
										}
										setDisabledButtons((prev) => new Set(prev).add(link.key));
										router.push(`${link.href}`);
									}}
									variant="ghost"
								>
									<span className={isActive ? "text-green-500" : ""}>
										{link.icon}
									</span>
									{link.labelMobile ? (
										<span>{link.labelMobile}</span>
									) : (
										link.label
									)}
								</Button>
							</li>
						);
					})}
				</ul>
			</nav>
		</>
	);
};

export default Sidebar;
