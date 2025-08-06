"use client";

import {
	BarChart3,
	ExternalLink,
	Link2,
	LogOut,
	Paintbrush,
	Settings,
	Table2,
	User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const links = [
	{
		key: "profile",
		href: "/dashboard/perfil",
		label: "Perfil",
		icon: <User className="h-4 w-4" />,
	},
	{
		key: "links",
		href: "/dashboard/links",
		label: "Links",
		icon: <Link2 className="h-4 w-4" />,
	},
	{
		key: "personalization",
		href: "/dashboard/personalizar",
		label: "Temas",
		icon: <Paintbrush className="h-4 w-4" />,
	},
	{
		key: "analytics",
		href: "/dashboard/analises",
		label: "Análises",
		icon: <BarChart3 className="h-4 w-4" />,
	},
	{
		key: "settings",
		href: "/dashboard/configs",
		label: "Configurações",
		labelMobile: "Configs.",
		icon: <Settings className="h-4 w-4" />,
	},
];

const Sidebar = () => {
	const pathname = usePathname();
	const router = useRouter();
	const { data: session } = useSession();
	const [disabledButtons, setDisabledButtons] = useState<Set<string>>(
		() => new Set(),
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
	const isLoading = !session || !session.user || !username;
	return (
		<>
			{/* Sidebar para telas médias e maiores */}
			<aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-r md:bg-card/40 px-2">
				<header className="flex h-16 items-center border-b pl-2">
					<Link
						href="/"
						className="flex items-center justify-center gap-2 font-semibold"
					>
						<Image
							src="/bionk-logo.svg"
							alt="logo"
							width={90}
							height={30}
							priority
						/>
					</Link>
				</header>

				<div className="flex flex-row max-w-full">
					<div className="flex items-center justify-center mt-4 mb-2">
						<div>
							{isLoading ? (
								<Skeleton className="w-12 h-12 rounded-full" />
							) : (
								<Image
									src={session.user.image || "/default-avatar.png"}
									alt="Avatar"
									width={48}
									height={48}
									className="rounded-full"
								/>
							)}
						</div>

						<div className="ml-3 flex flex-col items-start">
							{isLoading ? (
								<Skeleton className="h-4 w-10 rounded-sm mb-1" />
							) : (
								<span className="mt-1 inline-flex items-center rounded-sm bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-500">
									Free
								</span>
							)}

							{isLoading ? (
								<>
									<Skeleton className="h-4 w-40 mb-1" />
									<Skeleton className="h-3 w-32" />
								</>
							) : (
								<>
									<h2 className="text-sm font-semibold w-40 whitespace-nowrap overflow-hidden text-ellipsis">
										{session.user.name}
									</h2>
									<p className="text-xs text-muted-foreground w-40 whitespace-nowrap overflow-hidden text-ellipsis">
										bionk.me/{username}
									</p>
								</>
							)}
						</div>
					</div>
				</div>
				<div className="py-2">
					<Link
						href={profileUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-2 justify-start w-full text-sm font-medium h-10 border border-transparent hover:bg-green-500 hover:text-white hover:border-green-400 transition-colors duration-200 rounded-md px-4"
					>
						<Table2 className="h-4 w-4" />
						<span className="flex items-center justify-between w-full">
							Ver meu perfil
							<ExternalLink className="h-4 w-4" />
						</span>
					</Link>
				</div>

				<nav className="space-y-1">
					{links.map((link) => {
						const isActive = pathname === link.href;
						return (
							<Button
								key={link.key}
								variant={isActive ? "secondary" : "ghost"}
								className={`justify-start w-full text-sm font-medium h-10 border border-transparent hover:border hover:border-gray-200 ${isActive ? "bg-secondary border-gray-200" : ""}`}
								disabled={disabledButtons.has(link.key)}
								onClick={() => {
									if (isActive) return;
									setDisabledButtons((prev) => new Set(prev).add(link.key));
									router.push(`${link.href}`);
								}}
							>
								<span className="mr-3">{link.icon}</span>
								{link.label}
							</Button>
						);
					})}
				</nav>

				<div className="mt-auto p-4 space-y-2 border-t">
					<Button
						className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
						variant="ghost"
						size="sm"
						onClick={handleLogout}
					>
						<LogOut className="h-4 w-4 mr-3" />
						Sair
					</Button>
				</div>
			</aside>

			{/* Menu fixo para mobile com ícones */}
			<nav className="fixed inset-x-0 bottom-0 z-50 bg-white border-t md:hidden">
				<ul className="grid grid-cols-5 divide-x divide-muted py-3">
					{links.map((link) => {
						const isActive = pathname === link.href;
						return (
							<li key={link.key} className="flex items-center justify-center">
								<Button
									variant="ghost"
									className={`flex flex-col items-center justify-center gap-1 px-1 text-[10px] sm:text-xs ${
										isActive ? "text-foreground" : "text-muted-foreground"
									}`}
									disabled={disabledButtons.has(link.key)}
									onClick={() => {
										if (isActive) return;
										setDisabledButtons((prev) => new Set(prev).add(link.key));
										router.push(`${link.href}`);
									}}
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
