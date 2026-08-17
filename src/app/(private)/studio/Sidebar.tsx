// src/app/(private)/studio/Sidebar.tsx
"use client";

import {
	ArrowSquareOut,
	Bell,
	ChartBar,
	Check,
	DotsThreeVerticalIcon,
	Download,
	Gear,
	Link as LinkIcon,
	PaintBrush,
	Palette,
	Plus,
	QrCode,
	Share,
	SquaresFour,
	Stack,
	Users,
} from "@phosphor-icons/react/dist/ssr";
import Cookies from "js-cookie";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type React from "react";
import { memo, useCallback, useEffect, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import useSWR from "swr";
import ShareListCompact from "@/components/ShareListCompact";
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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ProfileActionsDropdown = ({
	profileUrl,
	username,
}: {
	profileUrl: string;
	username: string | null | undefined;
}) => {
	const [isQrOpen, setIsQrOpen] = useState(false);
	const shareText = `Confira meu perfil na Bionk: ${username || ""}`;
	const logoUrl = "/images/bionk-icon-black.svg";

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
		<DropdownMenuContent
			align="end"
			className="ml-3 grid w-60 gap-2 border p-2"
		>
			<DropdownMenuLabel className="py-1">Compartilhar</DropdownMenuLabel>
			<DropdownMenuSeparator />
			<DropdownMenuItem asChild>
				<Link
					className="flex h-10 cursor-pointer items-center"
					href={profileUrl}
					rel="noopener noreferrer"
					target="_blank"
				>
					<ArrowSquareOut className="h-4 w-4" weight="regular" />
					<span>Abrir </span>
				</Link>
			</DropdownMenuItem>

			<DropdownMenuSub onOpenChange={setIsQrOpen}>
				<DropdownMenuSubTrigger className="h-10 cursor-pointer">
					<QrCode className="mr-2 h-4 w-4" weight="regular" />
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
								<Download className="mr-2 h-4 w-4" weight="regular" />
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
					<Share className="mr-2 h-4 w-4" weight="regular" />
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
	icon: React.ElementType;
}

const mainLinks: SidebarLink[] = [
	{
		key: "profile",
		href: "/studio",
		label: "Studio",
		icon: Stack,
	},
	{
		key: "links",
		href: "/studio/links",
		label: "Links",
		icon: LinkIcon,
	},
	{
		key: "personalization",
		href: "/studio/design",
		label: "Design",
		icon: PaintBrush,
	},
	{
		key: "analytics",
		href: "/studio/analises",
		label: "Análises",
		icon: ChartBar,
	},
	{
		key: "audience",
		href: "/studio/audiencia",
		label: "Audiência",
		icon: Users,
	},
];

const toolsLinks: SidebarLink[] = [
	{
		key: "creators",
		href: "/studio/criadores",
		label: "Para Criadores",
		icon: Palette,
	},
	{
		key: "integrations",
		href: "/studio/integracoes",
		label: "Integrações",
		icon: SquaresFour,
	},
];

const Sidebar = () => {
	const pathname = usePathname();
	const router = useRouter();
	const { data: session } = useSession();
	const { subscriptionPlan } = useSubscription();
	const { theme } = useTheme();
	const [profileUrl, setProfileUrl] = useState("#");
	const [imageKey, setImageKey] = useState(0);
	const [userName, setUserName] = useState<string>("");
	const [userUsername, setUserUsername] = useState<string>("");
	const [userImageUrl, setUserImageUrl] = useState<string>("");

	const username = userUsername || session?.user?.username;
	const isLoading = !(session?.user && username);

	const { data: profilesData } = useSWR("/api/profile/all", fetcher);
	const profiles = profilesData?.profiles || [];
	const maxProfiles = 10;
	const canCreateMore = profiles.length < maxProfiles;

	const handleSwitchProfile = (profileId: string) => {
		Cookies.set("bionk_active_profile_id", profileId, {
			path: "/",
			expires: 30,
			sameSite: "lax",
		});
		window.location.href = "/studio/design";
	};

	// Função para buscar dados atuais do usuário
	const fetchCurrentUserData = useCallback(async () => {
		if (!session?.user?.id) {
			return;
		}

		try {
			const response = await fetch("/api/profile");
			if (response.ok) {
				const userData = await response.json();
				setUserName(userData.name || "");
				setUserUsername(userData.username || "");
				setUserImageUrl(userData.image || "");
				setImageKey(Date.now());
			}
		} catch (error) {
			console.error("Erro ao buscar dados do usuário:", error);
		}
	}, [session?.user?.id]);

	useEffect(() => {
		const baseUrl =
			process.env.NEXT_PUBLIC_APP_URL || "https://bionk.duckdns.org";
		setProfileUrl(username ? `${baseUrl}/${username}` : "#");
	}, [username]);

	// Atualiza a chave da imagem quando a sessão muda
	useEffect(() => {
		if (session?.user?.image) {
			setImageKey(Date.now());
		}
	}, [session?.user?.image]);

	useEffect(() => {
		setImageKey(Date.now());
	}, []);

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
				process.env.NEXT_PUBLIC_APP_URL || "https://bionk.duckdns.org";
			setProfileUrl(newUsername ? `${baseUrl}/${newUsername}` : "#");
			setUserUsername(newUsername);
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
				const Icon = link.icon;
				return (
					<Button
						className={`h-8 w-full justify-start rounded-lg border-none px-3 font-medium text-sm transition-all ${
							isActive
								? "bg-zinc-200 text-black dark:bg-zinc-700 dark:text-white"
								: "text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700"
						}`}
						key={link.key}
						onClick={() => !isActive && handleNavClick(link.href)}
						variant="ghost"
					>
						<Icon
							className="h-5 w-5 md:h-4 md:w-4"
							weight={isActive ? "duotone" : "regular"}
						/>
						{link.label}
					</Button>
				);
			}),
		[pathname, handleNavClick]
	);

	return (
		<>
			{/* Sidebar desktop */}
			<aside className="hidden px-3 transition-colors md:fixed md:inset-y-0 md:left-0 md:flex md:w-60 md:flex-col md:border-r md:bg-zinc-50/70 md:backdrop-blur-lg dark:md:border-zinc-700 dark:md:bg-zinc-900">
				<header className="flex h-16 items-center justify-between border-b pr-2 pl-2 dark:border-zinc-700">
					<Link className="flex items-center gap-2 font-semibold" href="/">
						<Image
							alt="logo"
							height={30}
							priority
							src={
								theme === "dark"
									? "/images/bionk-name-white-logo.svg"
									: "/images/bionk-name-logo.svg"
							}
							width={90}
						/>
					</Link>
					<div className="flex items-center gap-1">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button
									className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
									type="button"
								>
									<Share className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
								</button>
							</DropdownMenuTrigger>
							<ProfileActionsDropdown
								profileUrl={profileUrl}
								username={username}
							/>
						</DropdownMenu>
						<button
							className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
							type="button"
						>
							<Bell className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
						</button>
					</div>
				</header>

				<div className="pt-2">
					<nav className="space-y-0.5">{renderNavLinks(mainLinks)}</nav>
				</div>

				<div className="mt-5">
					<h3 className="mb-2 px-3 font-semibold text-xs text-zinc-400 tracking-wider dark:text-zinc-300">
						Ferramentas
					</h3>
					<nav className="space-y-0.5">{renderNavLinks(toolsLinks)}</nav>
				</div>

				{/* Switcher de Perfis */}
				<div className="mt-auto mb-3">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<div
								className="flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors duration-200 hover:bg-zinc-200 dark:hover:bg-zinc-600 "
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
													? imageKey > 0
														? `${userImageUrl || session?.user?.image}?t=${imageKey}`
														: `${userImageUrl || session?.user?.image}`
													: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png"
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
										<DotsThreeVerticalIcon
											className="h-5 w-5 text-zinc-500 dark:text-zinc-300"
											weight="regular"
										/>
									</>
								)}
							</div>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="center"
							className="w-56 border border-zinc-200 p-2 dark:border-zinc-800"
							side="top"
							sideOffset={12}
						>
							<DropdownMenuSub>
								<DropdownMenuSubTrigger className="h-10 cursor-pointer gap-2 font-medium">
									<Users className="h-4 w-4 text-zinc-500" weight="regular" />
									<span>Alternar Página</span>
								</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="max-h-[60vh] w-64 overflow-y-auto border border-zinc-200 p-2 dark:border-zinc-800">
									{profiles.map((p: any) => {
										const isActive =
											p.username === (userUsername || session?.user?.username);
										return (
											<DropdownMenuItem
												className="flex cursor-pointer items-center justify-between py-2"
												key={p.id}
												onClick={() => handleSwitchProfile(p.id)}
											>
												<div className="flex items-center gap-3 truncate">
													<Image
														alt={p.username}
														className="shrink-0 rounded-full"
														height={24}
														src={
															p.image ||
															"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png"
														}
														width={24}
													/>
													<div className="flex flex-col truncate">
														<span className="truncate font-medium text-sm">
															{p.name}
														</span>
														<span className="truncate text-xs text-zinc-500">
															@{p.username}
														</span>
													</div>
												</div>
												{isActive && (
													<Check
														className="h-4 w-4 shrink-0 text-zinc-900 dark:text-zinc-100"
														weight="bold"
													/>
												)}
											</DropdownMenuItem>
										);
									})}
									{canCreateMore && (
										<>
											<DropdownMenuSeparator className="my-1" />
											<DropdownMenuItem
												className="flex cursor-pointer items-center justify-center py-2 font-medium text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
												onClick={() => router.push("/studio/new")}
											>
												<Plus className="mr-2 h-4 w-4" weight="bold" />
												Criar nova página
											</DropdownMenuItem>
										</>
									)}
								</DropdownMenuSubContent>
							</DropdownMenuSub>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="h-10 cursor-pointer px-2 font-medium"
								onClick={() => router.push("/studio/configs")}
							>
								<Gear className="h-4 w-4 text-zinc-500" weight="regular" />
								<span>Configurações</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</aside>

			{/* Navbar mobile */}
			<nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-white transition-colors md:hidden dark:border-zinc-700 dark:bg-zinc-800">
				<ul className="grid grid-cols-5 py-3">
					{mainLinks.map((link) => {
						const isActive = pathname === link.href;
						const Icon = link.icon;
						return (
							<li className="flex items-center justify-center" key={link.key}>
								<Button
									className={`flex flex-col items-center gap-1 px-1 font-semibold text-xs ${
										isActive
											? "text-black dark:text-white"
											: "text-zinc-500 dark:text-zinc-400"
									}`}
									onClick={() => !isActive && handleNavClick(link.href)}
									variant="ghost"
								>
									<Icon
										className="h-6 w-6"
										weight={isActive ? "duotone" : "regular"}
									/>
									<span className="w-full truncate text-center">
										{link.labelMobile || link.label}
									</span>
								</Button>
							</li>
						);
					})}
					{/* Studio mobile */}
					<li className="flex items-center justify-center">
						<Button
							className="flex flex-col items-center gap-1 px-1 font-semibold text-xs text-zinc-500 sm:text-xs dark:text-zinc-400"
							onClick={() => router.push("/studio/configs")}
							variant="ghost"
						>
							{isLoading ? (
								<Skeleton className="h-6 w-6 rounded-full" />
							) : (
								<Image
									alt="Avatar"
									className="rounded-full"
									height={20}
									src={
										userImageUrl || session?.user?.image
											? imageKey > 0
												? `${userImageUrl || session?.user?.image}?t=${imageKey}`
												: `${userImageUrl || session?.user?.image}`
											: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png"
									}
									width={20}
								/>
							)}
							<span className="-mt-1">Conta</span>
						</Button>
					</li>
				</ul>
			</nav>
		</>
	);
};

export default memo(Sidebar);
