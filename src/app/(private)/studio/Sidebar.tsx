"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
	BarChart3,
	Blocks,
	ChevronsUpDown,
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
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SidebarLink {
	key: string;
	href: string;
	label: string;
	labelMobile?: string;
	icon: React.ReactNode;
}

const mainLinks: SidebarLink[] = [
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
];

const toolsLinks: SidebarLink[] = [
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
	const [profileUrl, setProfileUrl] = useState("#");
	const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);

	const username = session?.user?.username;
	const isLoading = !(session?.user && username);

	// URL pública do perfil
	useEffect(() => {
		const baseUrl =
			process.env.NODE_ENV === "production"
				? "https://www.bionk.me"
				: "http://localhost:3000";
		setProfileUrl(username ? `${baseUrl}/${username}` : "#");
	}, [username]);

	// Buscar plano do usuário
	useEffect(() => {
		const fetchPlan = async () => {
			if (session?.user?.id) {
				try {
					const res = await fetch("/api/user-plan");
					if (res.ok) {
						const data = await res.json();
						setSubscriptionPlan(data.subscriptionPlan);
					}
				} catch {
					setSubscriptionPlan("");
				}
			}
		};
		fetchPlan();
	}, [session?.user?.id]);

	const handleNavClick = (href: string, key: string, isActive: boolean) => {
		if (!isActive) {
			setDisabledButtons((prev) => new Set(prev).add(key));
			router.push(href);
		}
	};

	const renderNavLinks = (links: SidebarLink[]) =>
		links.map((link) => {
			const isActive = pathname === link.href;
			return (
				<Button
					className={`h-10 w-full justify-start rounded-xl px-3 font-medium text-sm transition-all ${
						isActive
							? "bg-green-100 text-green-700 shadow-sm"
							: "text-gray-700 hover:bg-gray-100"
					}`}
					disabled={disabledButtons.has(link.key)}
					key={link.key}
					onClick={() => handleNavClick(link.href, link.key, isActive)}
					variant="ghost"
				>
					<span className="mr-3">{link.icon}</span>
					{link.label}
				</Button>
			);
		});

	return (
		<>
			{/* Sidebar desktop */}
			<aside className="hidden px-3 md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col md:border-r md:bg-white/70 md:backdrop-blur-lg">
				{/* Logo */}
				<header className="flex h-16 items-center border-b pl-2">
					<Link className="flex items-center gap-2 font-semibold" href="/">
						<Image
							alt="logo"
							height={30}
							priority
							src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755641260/bionk-logo_sehkbi.svg"
							width={90}
						/>
					</Link>
				</header>

				{/* Link para perfil público */}
				<div className="py-2">
					<Link
						className="flex h-10 w-full items-center justify-between rounded-lg px-4 font-medium text-sm transition-colors hover:bg-green-500 hover:text-white"
						href={profileUrl}
						rel="noopener noreferrer"
						target="_blank"
					>
						<div className="flex items-center gap-2">
							<Table2 className="h-4 w-4" />
							Ver meu perfil
						</div>
						<ExternalLink className="h-4 w-4" />
					</Link>
				</div>

				{/* Navegação principal */}
				<div>
					<h3 className="mb-2 px-3 font-semibold text-gray-400 text-xs tracking-wider">
						Studio
					</h3>
					<nav className="space-y-1">{renderNavLinks(mainLinks)}</nav>
				</div>

				{/* Ferramentas */}
				<div className="mt-5">
					<h3 className="mb-2 px-3 font-semibold text-gray-400 text-xs tracking-wider">
						Ferramentas
					</h3>
					<nav className="space-y-1">{renderNavLinks(toolsLinks)}</nav>
				</div>

				{/* Perfil + dropdown */}
				<div className="mt-auto mb-3 rounded-xl border bg-gray-50 p-3 shadow-sm">
					{isLoading ? (
						<Skeleton className="h-12 w-12 rounded-full" />
					) : (
						<div className="flex items-center gap-3">
							<Image
								alt="Avatar"
								className="rounded-full"
								height={42}
								src={session?.user?.image || "/default-avatar.png"}
								width={42}
							/>
							<div className="flex flex-1 flex-col truncate">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<button className="flex w-full items-center justify-between text-left outline-none" type="button">
											<div className="flex flex-col">
												<h2 className="truncate font-semibold text-sm">
													{session?.user?.name}
												</h2>
												<p className="truncate text-gray-500 text-xs">
													bionk.me/{username}
												</p>
											</div>
											<ChevronsUpDown className="h-4 w-4 text-gray-400" />
										</button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="end"
										className="w-44 rounded-lg border bg-white shadow-md"
										side="top"
									>
										<DropdownMenuItem
											onClick={() => router.push("/studio/configs")}
										>
											<Settings className="mr-2 h-4 w-4" />
											Configurações
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => router.push("/api/auth/signout")}
										>
											<LogOut className="mr-2 h-4 w-4" />
											Sair
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
								{subscriptionPlan && (
									<span className="mt-1 inline-block w-fit rounded-md bg-green-100 px-2 py-0.5 font-medium text-[10px] text-green-600 capitalize">
										{subscriptionPlan}
									</span>
								)}
							</div>
						</div>
					)}
				</div>
			</aside>

			{/* Navbar mobile */}
			<nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-white md:hidden">
				<ul className="grid grid-cols-5 divide-x divide-gray-100 py-3">
					{mainLinks.map((link) => {
						const isActive = pathname === link.href;
						return (
							<li className="flex items-center justify-center" key={link.key}>
								<Button
									className={`flex flex-col items-center gap-1 px-1 text-[10px] sm:text-xs ${
										isActive ? "text-green-600" : "text-gray-500"
									}`}
									disabled={disabledButtons.has(link.key)}
									onClick={() => handleNavClick(link.href, link.key, isActive)}
									variant="ghost"
								>
									{link.icon}
									{link.labelMobile ?? link.label}
								</Button>
							</li>
						);
					})}
					{/* Perfil no mobile */}
					<li className="flex items-center justify-center">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									className="flex flex-col items-center gap-1 px-1 text-[10px] sm:text-xs"
									variant="ghost"
								>
									<User className="h-4 w-4" />
									Conta
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="center"
								className="w-40 rounded-lg"
								side="top"
							>
								<DropdownMenuItem
									onClick={() => router.push("/studio/configs")}
								>
									<Settings className="mr-2 h-4 w-4" />
									Configurações
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => router.push("/api/auth/signout")}
								>
									<LogOut className="mr-2 h-4 w-4" />
									Sair
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</li>
				</ul>
			</nav>
		</>
	);
};

export default Sidebar;
