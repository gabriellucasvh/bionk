"use client";

import {
	Archive as ArchiveBox,
	Clock,
	Edit,
	Grip,
	Image,
	Lock,
	MoreVertical,
	MousePointerClick,
	Save,
	Tags,
	Trash2,
	X,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ArchivingLoader from "@/components/animations/ArchivingLoader";
import { BaseButton } from "@/components/buttons/BaseButton";
import ImageCropModal from "@/components/modals/ImageCropModal";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useLinkAnimation } from "@/providers/linkAnimationProvider";
import type { LinkItem } from "../types/links.types";
import { isValidUrl } from "../utils/links.helpers";
import { useCountdown } from "../utils/useCountdown";

// Tipos e Interfaces
interface LinkCardProps {
	link: LinkItem;
	listeners: any;
	setActivatorNodeRef: (element: HTMLElement | null) => void;
	onLinkChange: (id: number, field: "title" | "url", value: string) => void;
	onLinkAdvancedChange?: (id: number, payload: Partial<LinkItem>) => void;
	onSaveEditing: (id: number, title: string, url: string) => void;
	onCancelEditing: (id: number) => void;
	onStartEditing: (id: number) => void;
	onToggleActive: (id: number, active: boolean) => void;
	onArchiveLink: (id: number) => void;
	onDeleteLink: (id: number) => void;
	onClickLink: (id: number) => void;
	onUpdateCustomImage?: (id: number, imageUrl: string) => void;
	onRemoveCustomImage?: (id: number) => void;
	borderRadius?: number;
	archivingLinkId?: number | null;
	isTogglingActive?: boolean;
	originalLink?: LinkItem | null;
}

// --- Subcomponentes ---

const CountdownTimer = ({
	date,
	prefix,
	endText,
}: {
	date: string;
	prefix: string;
	endText: string;
}) => {
	const { days, hours, minutes, seconds, hasEnded } = useCountdown(date);
	if (hasEnded) {
		// Se não houver endText (string vazia), não renderiza nada para evitar duplicação
		if (!endText || endText.trim().length === 0) {
			return null;
		}
		return <p className="font-medium text-red-600 text-sm">{endText}</p>;
	}
	return (
		<div className="flex items-center gap-1 text-center font-semibold text-green-700 text-sm">
			<Clock className="h-4 w-4" />
			<span>{prefix}: </span>
			<span>{`${days}d ${hours}h ${minutes}m ${seconds}s`}</span>
		</div>
	);
};

const EditingView = ({
	link,
	onLinkChange,
	onLinkAdvancedChange,
	onSaveEditing,
	onCancelEditing,
	originalLink,
}: Omit<
	LinkCardProps,
	| "listeners"
	| "setActivatorNodeRef"
	| "onToggleActive"
	| "onArchiveLink"
	| "onDeleteLink"
	| "onClickLink"
>) => {
	const [isLoading, setIsLoading] = useState(false);

	const toInputValue = (iso?: string | null) => {
		if (!iso) {
			return "";
		}
		const d = new Date(iso);
		const pad = (n: number) => `${n}`.padStart(2, "0");
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
			d.getHours()
		)}:${pad(d.getMinutes())}`;
	};
	// Valor mínimo (agora) para inputs datetime-local
	const nowInputValue = () => {
		const d = new Date();
		const pad = (n: number) => `${n}`.padStart(2, "0");
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
			d.getHours()
		)}:${pad(d.getMinutes())}`;
	};

	const hasChanges = originalLink
		? link.title !== originalLink.title ||
			(link.url || "") !== (originalLink.url || "") ||
			(link.badge || null) !== (originalLink.badge || null) ||
			(link.password || null) !== (originalLink.password || null) ||
			(link.deleteOnClicks ?? null) !== (originalLink.deleteOnClicks ?? null) ||
			(link.launchesAt || null) !== (originalLink.launchesAt || null) ||
			(link.expiresAt || null) !== (originalLink.expiresAt || null) ||
			(link.shareAllowed ?? false) !== (originalLink.shareAllowed ?? false)
		: true;

	// Toggles para opções avançadas
	const [passwordEnabled, setPasswordEnabled] = useState(
		!!(link.password && link.password.length > 0)
	);
	const [expiresEnabled, setExpiresEnabled] = useState(!!link.expiresAt);
	const [deleteClicksEnabled, setDeleteClicksEnabled] = useState(
		!!link.deleteOnClicks
	);

	const [badgeEnabled, setBadgeEnabled] = useState(!!link.badge);
	const [launchEnabled, setLaunchEnabled] = useState(!!link.launchesAt);

	const handleSave = async () => {
		setIsLoading(true);
		try {
			await onSaveEditing(link.id, link.title, link.url || "");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-3 rounded-lg border-2 border-foreground/20 p-3 sm:p-4">
			<div className="space-y-3">
				<div className="space-y-1.5">
					{/* Campos principais com labels */}
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="title">Título *</Label>
							<Input
								className="bg-white dark:bg-[#202020]"
								id="title"
								maxLength={80}
								onChange={(e) => onLinkChange(link.id, "title", e.target.value)}
								placeholder="Ex: Meu Portfólio"
								value={link.title}
							/>
							<p className="mt-1 text-muted-foreground text-xs">
								{link.title.length}/80 caracteres
							</p>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="url">URL *</Label>
							<Input
								className="bg-white dark:bg-[#202020]"
								id="url"
								onChange={(e) => onLinkChange(link.id, "url", e.target.value)}
								placeholder="https://exemplo.com"
								type="url"
								value={link.url || ""}
							/>
							<div className="mt-1 h-4" />
						</div>
					</div>

					{/* Opções Avançadas */}
					<div className="border-t pt-3">
						<p className="text-center font-medium text-muted-foreground text-xs">
							OPÇÕES AVANÇADAS
						</p>
					</div>

					{/* Proteger com Senha */}
					<div className="rounded-md border p-3">
						<div className="flex items-center justify-between gap-3">
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-md bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
									<Lock className="h-5 w-5" />
								</div>
								<div>
									<div className="font-medium">Proteger com Senha</div>
									<div className="text-muted-foreground text-sm">
										Exigir senha para acessar o link
									</div>
								</div>
							</div>
							<Switch
								checked={passwordEnabled}
								onCheckedChange={(v) => {
									setPasswordEnabled(v);
									if (!v) {
										onLinkAdvancedChange?.(link.id, { password: "" });
									}
								}}
							/>
						</div>
						{passwordEnabled && (
							<div className="mt-2">
								<div className="grid gap-2">
									<Label htmlFor="password">Senha de Acesso</Label>
									<Input
										id="password"
										maxLength={20}
										onChange={(e) =>
											onLinkAdvancedChange?.(link.id, {
												password: e.target.value,
											})
										}
										placeholder="••••••••"
										type="password"
										value={link.password || ""}
									/>
								</div>
							</div>
						)}
					</div>

					{/* Data de Expiração */}
					<div className="rounded-md border p-3">
						<div className="flex items-center justify-between gap-3">
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
									<Clock className="h-5 w-5" />
								</div>
								<div>
									<div className="font-medium">Data de Expiração</div>
									<div className="text-muted-foreground text-sm">
										Link ficará inativo automaticamente
									</div>
								</div>
							</div>
							<Switch
								checked={expiresEnabled}
								onCheckedChange={(v) => {
									setExpiresEnabled(v);
									if (!v) {
										onLinkAdvancedChange?.(link.id, { expiresAt: null });
									}
								}}
							/>
						</div>
						{expiresEnabled && (
							<div className="mt-2 space-y-2">
								<div className="grid gap-2">
									<Label htmlFor="expiresAt">Expira em</Label>
									<Input
										id="expiresAt"
										min={nowInputValue()}
										onChange={(e) => {
											const v = e.target.value;
											if (v && new Date(v).getTime() < Date.now()) {
												return;
											}
											onLinkAdvancedChange?.(link.id, {
												expiresAt: v || null,
											});
										}}
										type="datetime-local"
										value={toInputValue(link.expiresAt)}
									/>
								</div>
								<div className="flex items-center justify-between gap-3 rounded-md border bg-background/50 p-3">
									<div className="flex items-center gap-3">
										<div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
											<MoreVertical className="h-5 w-5" />
										</div>
										<div>
											<div className="font-medium">
												Permitir compartilhamento
											</div>
										</div>
									</div>
									<Switch
										checked={!!link.shareAllowed}
										onCheckedChange={(v) => {
											onLinkAdvancedChange?.(link.id, { shareAllowed: v });
										}}
									/>
								</div>
							</div>
						)}
					</div>

					{/* Limite de Cliques */}
					<div className="rounded-md border p-3">
						<div className="flex items-center justify-between gap-3">
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
									<MousePointerClick className="h-5 w-5" />
								</div>
								<div>
									<div className="font-medium">Limite de Cliques</div>
									<div className="text-muted-foreground text-sm">
										Excluir após X cliques
									</div>
								</div>
							</div>
							<Switch
								checked={deleteClicksEnabled}
								onCheckedChange={(v) => {
									setDeleteClicksEnabled(v);
									if (!v) {
										onLinkAdvancedChange?.(link.id, { deleteOnClicks: null });
									}
								}}
							/>
						</div>
						{deleteClicksEnabled && (
							<div className="mt-2 space-y-2">
								<div className="grid gap-2">
									<Label htmlFor="deleteOnClicks">Excluir após X cliques</Label>
									<Input
										id="deleteOnClicks"
										inputMode="numeric"
										max={999_999}
										min={1}
										onChange={(e) => {
											const raw = e.target.value.replace(/\D/g, "").slice(0, 6);
											onLinkAdvancedChange?.(link.id, {
												deleteOnClicks: raw ? Math.max(1, Number(raw)) : null,
											});
										}}
										pattern="[0-9]*"
										placeholder="Ex: 100"
										type="text"
										value={(link.deleteOnClicks ?? "").toString()}
									/>
								</div>
								<div className="flex items-center justify-between gap-3 rounded-md border bg-background/50 p-3">
									<div className="flex items-center gap-3">
										<div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
											<MoreVertical className="h-5 w-5" />
										</div>
										<div>
											<div className="font-medium">
												Permitir compartilhamento
											</div>
										</div>
									</div>
									<Switch
										checked={!!link.shareAllowed}
										onCheckedChange={(v) => {
											onLinkAdvancedChange?.(link.id, { shareAllowed: v });
										}}
									/>
								</div>
							</div>
						)}
					</div>

					{/* Adicionar Badge */}
					<div className="rounded-md border p-3">
						<div className="flex items-center justify-between gap-3">
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-md bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
									<Tags className="h-5 w-5" />
								</div>
								<div>
									<div className="font-medium">Adicionar Badge</div>
									<div className="text-muted-foreground text-sm">
										Destaque o link com uma etiqueta
									</div>
								</div>
							</div>
							<Switch
								checked={badgeEnabled}
								onCheckedChange={(v) => {
									setBadgeEnabled(v);
									if (!v) {
										onLinkAdvancedChange?.(link.id, { badge: null });
									}
								}}
							/>
						</div>
						{badgeEnabled && (
							<div className="mt-2">
								<div className="grid gap-2">
									<Label htmlFor="badge">Badge</Label>
									<Input
										id="badge"
										maxLength={12}
										onChange={(e) =>
											onLinkAdvancedChange?.(link.id, {
												badge: e.target.value.slice(0, 12) || null,
											})
										}
										placeholder="Ex: PROMO"
										value={link.badge ?? ""}
									/>
									<p className="text-muted-foreground text-xs">
										Máximo de 12 caracteres.
									</p>
								</div>
							</div>
						)}
					</div>

					{/* Lançamento */}
					<div className="rounded-md border p-3">
						<div className="flex items-center justify-between gap-3">
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
									<Clock className="h-5 w-5" />
								</div>
								<div>
									<div className="font-medium">Lançamento</div>
									<div className="text-muted-foreground text-sm">
										Link será lançado automaticamente
									</div>
								</div>
							</div>
							<Switch
								checked={launchEnabled}
								onCheckedChange={(v) => {
									setLaunchEnabled(v);
									if (!v) {
										onLinkAdvancedChange?.(link.id, { launchesAt: null });
									}
								}}
							/>
						</div>
						{launchEnabled && (
							<div className="mt-2">
								<div className="grid gap-2">
									<Label htmlFor="launchesAt">Lançamento Agendado</Label>
									<Input
										id="launchesAt"
										min={nowInputValue()}
										onChange={(e) => {
											const v = e.target.value;
											if (v && new Date(v).getTime() < Date.now()) {
												return;
											}
											onLinkAdvancedChange?.(link.id, {
												launchesAt: v || null,
											});
										}}
										type="datetime-local"
										value={toInputValue(link.launchesAt)}
									/>
								</div>
							</div>
						)}
					</div>
				</div>

				<div className="flex justify-end gap-2">
					<BaseButton onClick={() => onCancelEditing(link.id)} variant="white">
						<X className="mr-2 h-4 w-4" />
						Cancelar
					</BaseButton>
					<BaseButton
						disabled={!(isValidUrl(link.url || "") && link.title && hasChanges)}
						loading={isLoading}
						onClick={handleSave}
					>
						<Save className="mr-2 h-4 w-4" />
						Salvar
					</BaseButton>
				</div>
			</div>
		</div>
	);
};

const LinkContent = ({
	link,
	isLinkLocked,
	onClickLink,
}: {
	link: LinkItem;
	isLinkLocked: boolean;
	onClickLink: (id: number) => void;
}) => {
	return (
		<Link
			className={cn(
				"max-w-[200px] truncate text-blue-500 text-sm hover:underline",
				isLinkLocked && "cursor-not-allowed text-muted-foreground"
			)}
			href={isLinkLocked ? "#" : link.url || "#"}
			onClick={() => !isLinkLocked && onClickLink(link.id)}
			rel="noopener noreferrer"
			target="_blank"
		>
			{link.url && link.url.length > 30
				? `${link.url.slice(0, 30)}...`
				: link.url || ""}
		</Link>
	);
};

// Função auxiliar para calcular estados do link
const useLinkStates = (link: LinkItem, archivingLinkId?: number | null) => {
	const { animatedLinks } = useLinkAnimation();
	const isLinkAnimated = animatedLinks.has(link.id.toString());
	const isArchiving = archivingLinkId === link.id;

	const isLaunching = !!(
		link.launchesAt && new Date(link.launchesAt) > new Date()
	);
	const isExpiring = !!(
		link.expiresAt && new Date(link.expiresAt) > new Date()
	);
	const isLinkLocked = isLaunching;

	return { isLinkAnimated, isArchiving, isLaunching, isExpiring, isLinkLocked };
};

// Componente para botões de ação
const LinkActionButtons = ({
	link,
	isLinkAnimated,
	setIsImageModalOpen,
	toggleAnimation,
	isExpired,
}: {
	link: LinkItem;
	isLinkAnimated: boolean;
	setIsImageModalOpen: (open: boolean) => void;
	toggleAnimation: (id: number) => Promise<void>;
	isExpired: boolean;
}) => (
	<div className="flex flex-wrap items-center gap-2">
		{/* Botão de imagem simples */}
		<Button
			className={cn(
				"h-8 w-8 flex-shrink-0",
				link.customImageUrl
					? "text-green-600 hover:text-green-700"
					: "text-muted-foreground hover:text-foreground"
			)}
			disabled={isExpired}
			onClick={() => {
				if (isExpired) {
					return;
				}
				setIsImageModalOpen(true);
			}}
			size="icon"
			title={
				isExpired
					? "Expirado — adicionar/alterar imagem indisponível"
					: link.customImageUrl
						? "Alterar imagem personalizada"
						: "Adicionar imagem personalizada"
			}
			variant="ghost"
		>
			<Image className="h-4 w-4" />
		</Button>
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					className={cn(
						"h-8 w-8 flex-shrink-0",
						isLinkAnimated
							? "text-green-600 hover:text-green-700"
							: "text-muted-foreground hover:text-foreground"
					)}
					disabled={isExpired}
					size="icon"
					title={
						isExpired
							? "Expirado — animação indisponível"
							: isLinkAnimated
								? "Desativar animação"
								: "Ativar animação"
					}
					variant="ghost"
				>
					<Zap className="h-4 w-4" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{isLinkAnimated ? "Desativar" : "Ativar"} Animação
					</AlertDialogTitle>
					<AlertDialogDescription>
						{isLinkAnimated
							? `Esta ação desativará a animação do link "${link.title || link.url}".`
							: `Esta ação fará o link "${link.title || link.url}" dar uma tremidinha infinita na sua página para chamar atenção dos visitantes.`}
						Deseja continuar?
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						className="bg-green-600 hover:bg-green-700"
						onClick={async () => {
							if (isExpired) {
								return;
							}
							await toggleAnimation(link.id);
						}}
					>
						{isLinkAnimated ? "Desativar" : "Ativar"} Animação
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
		<Badge className="flex flex-shrink-0 items-center gap-1" variant="outline">
			<MousePointerClick className="h-3 w-3" />
			<span className="hidden sm:inline">
				{(link.clicks || 0).toLocaleString()}
			</span>
			<span className="sm:hidden">{link.clicks || 0}</span>
		</Badge>
	</div>
);

const DisplayView = (props: LinkCardProps) => {
	const {
		link,
		listeners,
		setActivatorNodeRef,
		onStartEditing,
		onToggleActive,
		onArchiveLink,
		onDeleteLink,
		onClickLink,
		onUpdateCustomImage,
		onRemoveCustomImage,
		archivingLinkId,
		isTogglingActive,
	} = props;

	const [isImageModalOpen, setIsImageModalOpen] = useState(false);
	const { toggleAnimation } = useLinkAnimation();
	const { isLinkAnimated, isArchiving, isLaunching, isExpiring, isLinkLocked } =
		useLinkStates(link, archivingLinkId);

	// Força re-render e estado correto ao expirar usando o countdown
	const { hasEnded: expirationEnded } = useCountdown(
		link.expiresAt ??
			new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10).toISOString()
	);
	const isExpired = !!link.expiresAt && expirationEnded;

	return (
		<article
			className={cn(
				"relative flex flex-col gap-3 rounded-lg border bg-white p-3 transition-all sm:p-4 dark:bg-neutral-900",
				isArchiving && "pointer-events-none"
			)}
		>
			{/* Overlay de loading durante arquivamento */}
			{isArchiving && (
				<div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm dark:bg-neutral-800/90">
					<ArchivingLoader size="md" />
				</div>
			)}
			<div className="flex items-start gap-2 sm:gap-4">
				<div
					ref={setActivatorNodeRef}
					{...listeners}
					className="cursor-grab touch-none pt-1"
				>
					<Grip className="h-5 w-5 text-muted-foreground" />
				</div>
				<div className="flex-1 space-y-2">
					<header className="flex flex-wrap items-center gap-2">
						<h3 className="font-medium">
							{link.title.length > 64
								? `${link.title.slice(0, 64)}...`
								: link.title}
						</h3>
						{link.badge && <Badge variant="secondary">{link.badge}</Badge>}
						{link.password && (
							<Lock className="h-3 w-3 text-muted-foreground" />
						)}
					</header>

					<LinkContent
						isLinkLocked={isLinkLocked}
						link={link}
						onClickLink={onClickLink}
					/>

					{/* Dentro do header do DisplayView, abaixo dos timers */}
					{isLaunching && link.launchesAt && (
						<CountdownTimer
							date={link.launchesAt}
							endText="Lançado!"
							prefix="Lança em"
						/>
					)}
					{isExpiring && !isExpired && !isLaunching && link.expiresAt && (
						<CountdownTimer
							date={link.expiresAt}
							endText=""
							prefix="Expira em"
						/>
					)}
					{!isLaunching && isExpired && link.expiresAt && (
						<p className="font-medium text-red-600 text-sm">Expirado!</p>
					)}
				</div>
			</div>
			<div className="flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
				<LinkActionButtons
					isExpired={isExpired}
					isLinkAnimated={isLinkAnimated}
					link={link}
					setIsImageModalOpen={setIsImageModalOpen}
					toggleAnimation={toggleAnimation}
				/>
				<div className="flex items-center justify-end gap-2 sm:gap-4">
					<div className="flex items-center space-x-2">
						<Switch
							checked={link.active}
							disabled={isTogglingActive || isExpired}
							id={`switch-${link.id}`}
							onCheckedChange={(checked) => onToggleActive(link.id, checked)}
						/>
						<Label
							className={cn(
								"text-sm",
								isTogglingActive || isExpired
									? "cursor-default opacity-50"
									: "cursor-pointer"
							)}
							htmlFor={`switch-${link.id}`}
							title={
								isExpired ? "Expirado — reativação indisponível" : undefined
							}
						>
							{link.active ? "Ativo" : "Inativo"}
						</Label>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								className="h-8 w-8 flex-shrink-0"
								size="icon"
								variant="ghost"
							>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => onStartEditing(link.id)}>
								<Edit className="mr-2 h-4 w-4" /> Editar
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => onArchiveLink(link.id)}>
								<ArchiveBox className="mr-2 h-4 w-4" /> Arquivar
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-destructive"
								onClick={() => onDeleteLink(link.id)}
							>
								<Trash2 className="mr-2 h-4 w-4" /> Deletar
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Modal de upload de imagem */}
			<ImageCropModal
				currentImageUrl={link.customImageUrl}
				isOpen={isImageModalOpen && !isExpired}
				linkId={link.id.toString()}
				onClose={() => setIsImageModalOpen(false)}
				onImageRemove={() => onRemoveCustomImage?.(link.id)}
				onImageSave={(imageUrl) => {
					onUpdateCustomImage?.(link.id, imageUrl);
					setIsImageModalOpen(false);
				}}
			/>
		</article>
	);
};

// --- Componente Principal ---
const LinkCard = (props: LinkCardProps) => {
	if (props.link.isEditing) {
		return <EditingView {...props} />;
	}
	return <DisplayView {...props} />;
};

export default LinkCard;
