// src/app/(private)/studio/Sidebar.tsx
"use client";

import {
	BarChart3,
	Blocks,
	Download,
	ExternalLink,
	GalleryHorizontalEnd,
	Link2,
	Paintbrush,
	QrCode,
	Share2,
	SwatchBook,
	User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import ShareListCompact from "@/components/ShareListCompact";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscription } from "@/providers/subscriptionProvider";
import { useTheme } from "@/providers/themeProvider";

const ProfileActionsDropdown = ({
	profileUrl,
	username,
}: {
	profileUrl: string;
	username: string | null | undefined;
}) => {
	const [isQrOpen, setIsQrOpen] = useState(false);
	const shareText = `Confira meu perfil na Bionk: ${username || ""}`;
	const logoUrl = "/bionk-logo-quadrado-pb.svg";

	const handleDownloadQrCode = useCallback(() => {
		const canvas = document.getElementById(
			"sidebar-qrcode"
		) as HTMLCanvasElement;
		if (canvas) {
			const link = document.createElement("a");
			link.href = canvas.toDataURL("image/png");
			link.download = `${username}-bionk-qrcode.png`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}, [username]);

	return (
		<DropdownMenuContent align="end" className="ml-3 grid w-60 gap-2 p-2">
			<DropdownMenuLabel>Compartilhe seu Bionk</DropdownMenuLabel>
			<DropdownMenuSeparator />
			<DropdownMenuItem asChild>
				<Link
					className="flex h-10 cursor-pointer items-center"
					href={profileUrl}
					rel="noopener noreferrer"
					target="_blank"
				>
					<ExternalLink className="h-4 w-4" />
					<span>Abrir </span>
				</Link>
			</DropdownMenuItem>

			<DropdownMenuSub onOpenChange={setIsQrOpen}>
				<DropdownMenuSubTrigger className="h-10 cursor-pointer">
					<QrCode className="mr-2 h-4 w-4" />
					<span>QR Code</span>
				</DropdownMenuSubTrigger>
				<DropdownMenuSubContent className="p-4">
					{isQrOpen && profileUrl !== "#" ? (
						<div className="flex flex-col items-center gap-3 ">
							<QRCode
								id="sidebar-qrcode"
								logoImage={logoUrl}
								logoPadding={5}
								logoWidth={30}
								qrStyle="dots"
								size={192}
								value={profileUrl}
							/>
							<Button
								className="w-full "
								onClick={handleDownloadQrCode}
								size="sm"
							>
								<Download className="mr-2 h-4 w-4" />
								Baixar PNG
							</Button>
						</div>
					) : (
						<p className="text-center text-muted-foreground text-sm">
							Abra para gerar o QR Code.
						</p>
					)}
				</DropdownMenuSubContent>
			</DropdownMenuSub>

			<DropdownMenuSub>
				<DropdownMenuSubTrigger className="h-10 cursor-pointer">
					<Share2 className="mr-2 h-4 w-4" />
					<span>Compartilhar por...</span>
				</DropdownMenuSubTrigger>
				<DropdownMenuSubContent className="p-2 md:max-w-md lg:max-w-full">
					<ShareListCompact title={shareText} url={profileUrl} />
				</DropdownMenuSubContent>
			</DropdownMenuSub>
		</DropdownMenuContent>
	);
};

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
		href: "/studio/design",
		label: "Design",
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
	const { subscriptionPlan } = useSubscription();
	const { theme } = useTheme();
	const [profileUrl, setProfileUrl] = useState("#");
	const [imageKey, setImageKey] = useState(Date.now());
	const [userName, setUserName] = useState<string>("");
	const [userImageUrl, setUserImageUrl] = useState<string>("");

	const username = session?.user?.username;
	const isLoading = !(session?.user && username);

	// Função para buscar dados atuais do usuário
	const fetchCurrentUserData = useCallback(async () => {
		if (!session?.user?.id) {
			return;
		}

		try {
			const response = await fetch(`/api/profile/${session.user.id}`);
			if (response.ok) {
				const userData = await response.json();
				setUserName(userData.name || "");
				setUserImageUrl(userData.image || "");
				setImageKey(Date.now());
			}
		} catch (error) {
			console.error("Erro ao buscar dados do usuário:", error);
		}
	}, [session?.user?.id]);

	useEffect(() => {
		const baseUrl =
			process.env.NODE_ENV === "production"
				? "https://www.bionk.me"
				: "http://localhost:3000";
		setProfileUrl(username ? `${baseUrl}/${username}` : "#");
	}, [username]);

	// Atualiza a chave da imagem quando a sessão muda
	useEffect(() => {
		if (session?.user?.image) {
			setImageKey(Date.now());
		}
	}, [session?.user?.image]);

	// Busca dados atuais do usuário quando a sessão carrega
	useEffect(() => {
		if (session?.user?.id) {
			fetchCurrentUserData();
		}
	}, [session?.user?.id, fetchCurrentUserData]);

	// Escuta evento customizado de atualização da imagem do perfil
	useEffect(() => {
		const handleProfileImageUpdate = (event: CustomEvent) => {
			setImageKey(Date.now());
			if (event.detail?.imageUrl) {
				setUserImageUrl(event.detail.imageUrl);
			}
		};

		window.addEventListener(
			"profileImageUpdated",
			handleProfileImageUpdate as EventListener
		);

		return () => {
			window.removeEventListener(
				"profileImageUpdated",
				handleProfileImageUpdate as EventListener
			);
		};
	}, []);

	// Escuta evento customizado de atualização do nome do perfil
	useEffect(() => {
		const handleProfileNameUpdate = (event: CustomEvent) => {
			setUserName(event.detail.name);
		};

		window.addEventListener(
			"profileNameUpdated",
			handleProfileNameUpdate as EventListener
		);

		return () => {
			window.removeEventListener(
				"profileNameUpdated",
				handleProfileNameUpdate as EventListener
			);
		};
	}, []);

	// Escuta evento customizado de atualização do username
	useEffect(() => {
		const handleUsernameUpdate = (event: CustomEvent) => {
			const newUsername = event.detail.username;
			const baseUrl =
				process.env.NODE_ENV === "production"
					? "https://www.bionk.me"
					: "http://localhost:3000";
			setProfileUrl(newUsername ? `${baseUrl}/${newUsername}` : "#");
		};

		window.addEventListener(
			"profileUsernameUpdated",
			handleUsernameUpdate as EventListener
		);

		return () => {
			window.removeEventListener(
				"profileUsernameUpdated",
				handleUsernameUpdate as EventListener
			);
		};
	}, []);

	const handleNavClick = useCallback(
		(href: string) => {
			router.push(href);
		},
		[router]
	);

	const renderNavLinks = useCallback(
		(links: SidebarLink[]) =>
			links.map((link) => {
				const isActive = pathname === link.href;
				return (
					<Button
						className={`h-10 w-full justify-start rounded-lg px-3 font-medium text-sm transition-all ${
							isActive
								? "bg-zinc-200 text-black shadow-sm dark:bg-zinc-700 dark:text-white"
								: "text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700"
						}`}
						key={link.key}
						onClick={() => !isActive && handleNavClick(link.href)}
						variant="ghost"
					>
						<span className="mr-3">{link.icon}</span>
						{link.label}
					</Button>
				);
			}),
		[pathname, handleNavClick]
	);

	return (
		<>
			{/* Sidebar desktop */}
			<aside className="hidden px-3 transition-colors md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col md:border-r md:bg-zinc-50/70 md:backdrop-blur-lg dark:md:border-zinc-700 dark:md:bg-zinc-900">
				<header className="flex h-16 items-center justify-between border-b pr-2 pl-2 dark:border-zinc-700">
					<Link className="flex items-center gap-2 font-semibold" href="/">
						<Image
							alt="logo"
							height={30}
							priority
							src={
								theme === "dark"
									? "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755640991/bionk-logo-white_ld4dzs.svg"
									: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755641260/bionk-logo_sehkbi.svg"
							}
							width={90}
						/>
					</Link>
					<ThemeToggle />
				</header>

				<div className="py-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								className="flex h-12 w-full items-center justify-between rounded-lg border border-zinc-200 bg-zinc-100 px-4 transition hover:bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600"
								variant="outline"
							>
								<div className="flex min-w-0 flex-1 flex-col items-start justify-center overflow-hidden text-left">
									<p className="flex items-center gap-2 font-medium text-sm">
										Compartilhar
									</p>
									<span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
										bionk.me/
										{username && username.length > 20
											? `${username.slice(0, 20)}...`
											: username}
									</span>
								</div>
								<ExternalLink className="h-5 w-5 flex-shrink-0 text-zinc-400 dark:text-zinc-300" />
							</Button>
						</DropdownMenuTrigger>
						<ProfileActionsDropdown
							profileUrl={profileUrl}
							username={username}
						/>
					</DropdownMenu>
				</div>

				<div>
					<h3 className="mb-2 px-3 font-semibold text-xs text-zinc-400 tracking-wider dark:text-zinc-300">
						Studio
					</h3>
					<nav className="space-y-1">{renderNavLinks(mainLinks)}</nav>
				</div>

				<div className="mt-5">
					<h3 className="mb-2 px-3 font-semibold text-xs text-zinc-400 tracking-wider dark:text-zinc-300">
						Ferramentas
					</h3>
					<nav className="space-y-1">{renderNavLinks(toolsLinks)}</nav>
				</div>

				{/* Perfil */}
				<div
					className="mt-auto mb-3 flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors duration-200 hover:bg-zinc-200 dark:hover:bg-zinc-600 "
					onClick={() => router.push("/studio/configs")}
					role="none"
				>
					{isLoading ? (
						<Skeleton className="h-12 w-12 rounded-full" />
					) : (
						<>
							<Image
								alt="Avatar"
								className="rounded-full"
								height={42}
								src={
									userImageUrl || session?.user?.image
										? `${userImageUrl || session?.user?.image}?t=${imageKey}`
										: "/default-avatar.png"
								}
								width={42}
							/>
							<div className="flex flex-1 flex-col truncate">
								<h2 className="truncate font-semibold text-sm dark:text-white">
									{userName || session?.user?.name}
								</h2>
								{subscriptionPlan && (
									<span
										className={`mt-1 inline-block w-fit rounded-md px-2 py-0.5 font-medium text-[10px] capitalize ${(() => {
											switch (subscriptionPlan) {
												case "free":
													return "bg-green-100 text-green-600 dark:bg-green-600 dark:text-green-100";
												case "basic":
													return "bg-gradient-to-r from-yellow-600 to-yellow-500 text-white";
												case "pro":
													return "bg-radial-[at_50%_75%] from-yellow-500 via-purple-500 to-blue-500 text-white";
												case "ultra":
													return "bg-gradient-to-r from-blue-600 to-blue-500 text-white";
												default:
													return "bg-green-100 text-green-600 dark:bg-green-600 dark:text-green-100";
											}
										})()}`}
									>
										{subscriptionPlan}
									</span>
								)}
							</div>
							<GalleryHorizontalEnd className="h-5 w-5 text-zinc-500 dark:text-zinc-300" />
						</>
					)}
				</div>
			</aside>

			{/* Navbar mobile */}
			<nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-white transition-colors md:hidden dark:border-zinc-700 dark:bg-zinc-800">
				<ul className="grid grid-cols-5 py-3">
					{mainLinks.map((link) => {
						const isActive = pathname === link.href;
						return (
							<li className="flex items-center justify-center" key={link.key}>
								<Button
									className={`flex flex-col items-center gap-1 px-1 text-[10px] sm:text-xs ${
										isActive
											? "text-green-600 dark:text-green-400"
											: "text-zinc-500 dark:text-zinc-400"
									}`}
									onClick={() => !isActive && handleNavClick(link.href)}
									variant="ghost"
								>
									{link.icon}
									{link.labelMobile ?? link.label}
								</Button>
							</li>
						);
					})}
					{/* Perfil mobile */}
					<li className="flex items-center justify-center">
						<Button
							className="flex flex-col items-center gap-1 px-1 text-[10px] text-zinc-500 sm:text-xs dark:text-zinc-400"
							onClick={() => router.push("/studio/configs")}
							variant="ghost"
						>
							{isLoading ? (
								<Skeleton className="h-6 w-6 rounded-full" />
							) : (
								<Image
									alt="Avatar"
									className="rounded-full"
									height={24}
									src={
										userImageUrl || session?.user?.image
											? `${userImageUrl || session?.user?.image}?t=${imageKey}`
											: "/default-avatar.png"
									}
									width={24}
								/>
							)}
							Conta
						</Button>
					</li>
				</ul>
			</nav>
		</>
	);
};

export default React.memo(Sidebar);
