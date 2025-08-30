// src/app/(private)/studio/Sidebar.tsx
"use client";

import ShareSheet from "@/components/ShareSheet";
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
import {
	BarChart3,
	Blocks,
	Download,
	ExternalLink,
	Link2,
	Paintbrush,
	QrCode,
	Settings,
	Share2,
	SwatchBook,
	User,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { QRCode } from "react-qrcode-logo";

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
		<DropdownMenuContent align="end" className="ml-3 grid w-xs gap-2 p-2">
			<DropdownMenuLabel>Ações do Perfil</DropdownMenuLabel>
			<DropdownMenuSeparator />
			<DropdownMenuItem asChild>
				<Link
					className="flex items-center"
					href={profileUrl}
					rel="noopener noreferrer"
					target="_blank"
				>
					<ExternalLink className="h-4 w-4" />
					<span>Abrir </span>
				</Link>
			</DropdownMenuItem>

			<DropdownMenuSub onOpenChange={setIsQrOpen}>
				<DropdownMenuSubTrigger>
					<QrCode className="mr-2 h-4 w-4" />
					<span>QR Code</span>
				</DropdownMenuSubTrigger>
				<DropdownMenuSubContent className="p-4">
					{isQrOpen && profileUrl !== "#" ? (
						<div className="flex flex-col items-center gap-3">
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
								className="w-full"
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
				<DropdownMenuSubTrigger>
					<Share2 className="mr-2 h-4 w-4" />
					<span>Compartilhar por...</span>
				</DropdownMenuSubTrigger>
				<DropdownMenuSubContent className="p-2 md:max-w-md lg:max-w-full">
					<ShareSheet title={shareText} url={profileUrl} />
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
	const [profileUrl, setProfileUrl] = useState("#");
	const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
	const [imageKey, setImageKey] = useState(Date.now());

	const username = session?.user?.username;
	const isLoading = !(session?.user && username);

	useEffect(() => {
		const baseUrl =
			process.env.NODE_ENV === "production"
				? "https://www.bionk.me"
				: "http://localhost:3000";
		setProfileUrl(username ? `${baseUrl}/${username}` : "#");
	}, [username]);

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

	// Atualiza a chave da imagem quando a sessão muda
	useEffect(() => {
		if (session?.user?.image) {
			setImageKey(Date.now());
		}
	}, [session?.user?.image]);

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
								? "bg-gray-200 text-green-700 shadow-sm"
								: "text-gray-700 hover:bg-gray-100"
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
			<aside className="hidden px-3 md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col md:border-r md:bg-white/70 md:backdrop-blur-lg">
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

				<div className="py-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								className="flex h-12 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 transition hover:bg-gray-200 hover:text-green-700"
								variant="outline"
							>
								<div className="flex flex-col items-start justify-center overflow-auto text-left">
									<p className="flex items-center gap-2 font-medium text-sm">
										Compartilhar
									</p>
									<span className="truncate text-gray-500 text-xs">
										bionk.me/{username}
									</span>
								</div>
								<ExternalLink className="h-5 w-5 flex-shrink-0 text-gray-400" />
							</Button>
						</DropdownMenuTrigger>
						<ProfileActionsDropdown
							profileUrl={profileUrl}
							username={username}
						/>
					</DropdownMenu>
				</div>

				<div>
					<h3 className="mb-2 px-3 font-semibold text-gray-400 text-xs tracking-wider">
						Studio
					</h3>
					<nav className="space-y-1">{renderNavLinks(mainLinks)}</nav>
				</div>

				<div className="mt-5">
					<h3 className="mb-2 px-3 font-semibold text-gray-400 text-xs tracking-wider">
						Ferramentas
					</h3>
					<nav className="space-y-1">{renderNavLinks(toolsLinks)}</nav>
				</div>

				{/* Perfil */}
				<div
					className="mt-auto mb-3 flex cursor-pointer items-center gap-3 rounded-xl border bg-gray-50 p-3 shadow-sm"
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
								src={session?.user?.image ? `${session.user.image}?t=${imageKey}` : "/default-avatar.png"}
								width={42}
							/>
							<div className="flex flex-1 flex-col truncate">
								<h2 className="truncate font-semibold text-sm">
									{session?.user?.name}
								</h2>
								{subscriptionPlan && (
									<span className="mt-1 inline-block w-fit rounded-md bg-green-100 px-2 py-0.5 font-medium text-[10px] text-green-600 capitalize">
										{subscriptionPlan}
									</span>
								)}
							</div>
							<Settings className="h-5 w-5 text-gray-500" />
						</>
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
							className="flex flex-col items-center gap-1 px-1 text-[10px] sm:text-xs"
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
									src={session?.user?.image ? `${session.user.image}?t=${imageKey}` : "/default-avatar.png"}
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
