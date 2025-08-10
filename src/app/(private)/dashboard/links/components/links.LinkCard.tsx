import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
	Archive as ArchiveBox,
	Edit,
	ExternalLink,
	Eye,
	EyeOff,
	Grip,
	MousePointerClick,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import type { LinkItem } from "../types/links.types";
import { getIconForUrl } from "../utils/links.helpers";

interface LinkCardProps {
	link: LinkItem;
	// biome-ignore lint/suspicious/noExplicitAny: Aqui se pede para renomear any para outro tipo, mas qualquer tipo quebra o resto do código #analisar
	listeners: any;
	setActivatorNodeRef: (element: HTMLElement | null) => void;
	onLinkChange: (id: number, field: "title" | "url", value: string) => void;
	onSaveEditing: (id: number, title: string, url: string) => void;
	onCancelEditing: (id: number) => void;
	onStartEditing: (id: number) => void;
	onToggleActive: (id: number, active: boolean) => void;
	onToggleSensitive: (id: number) => void;
	onArchiveLink: (id: number) => void;
	onDeleteLink: (id: number) => void;
	onClickLink: (id: number) => void;
}

const LinkCard = ({
	link,
	listeners,
	setActivatorNodeRef,
	onLinkChange,
	onSaveEditing,
	onCancelEditing,
	onStartEditing,
	onToggleActive,
	onToggleSensitive,
	onArchiveLink,
	onDeleteLink,
	onClickLink,
}: LinkCardProps) => {
	return (
		<article
			className={cn(
				"flex flex-col gap-2 rounded-lg border-2 p-2 transition-all sm:gap-4 sm:p-4",
				"sm:flex-row sm:items-center",
				link.sensitive && "border-rose-400"
			)}
		>
			<div className="flex items-center gap-2 sm:w-7/12 sm:gap-3">
				<div
					ref={setActivatorNodeRef}
					{...listeners}
					className="cursor-move touch-none"
				>
					<Grip className="h-5 w-5 text-muted-foreground" />
				</div>

				<div className="flex-1 space-y-1">
					{link.isEditing ? (
						<section className="space-y-2">
							<input
								className="w-full rounded border px-2 py-1"
								onChange={(e) => onLinkChange(link.id, "title", e.target.value)}
								type="text"
								value={link.title}
							/>
							<input
								className="w-full rounded border px-2 py-1"
								onChange={(e) => onLinkChange(link.id, "url", e.target.value)}
								type="url"
								value={link.url}
							/>
							<div className="flex gap-2">
								<Button
									onClick={() => onSaveEditing(link.id, link.title, link.url)}
									type="submit"
								>
									Salvar
								</Button>
								<Button
									onClick={() => onCancelEditing(link.id)}
									variant="outline"
								>
									Cancelar
								</Button>
							</div>
						</section>
					) : (
						<>
							<header className="flex items-center gap-2">
								<h3 className="flex items-center gap-1 font-medium">
									<span className="mt-0.5">{getIconForUrl(link.url)}</span>
									{link.title.length > 26
										? `${link.title.slice(0, 26)}...`
										: link.title}
								</h3>
							</header>
							<section className="flex items-center gap-1 text-blue-500 text-sm">
								<ExternalLink className="h-3 w-3" />
								<Link
									className="max-w-[200px] truncate"
									href={link.url}
									onClick={() => onClickLink(link.id)}
									rel="noopener noreferrer"
									target="_blank"
								>
									{link.url.length > 26
										? `${link.url.slice(0, 26)}...`
										: link.url}
								</Link>
							</section>
						</>
					)}
				</div>
			</div>
			<div className="flex items-center gap-2 sm:w-5/12 sm:justify-end">
				<Badge className="flex items-center gap-1" variant="secondary">
					<MousePointerClick className="h-3 w-3" />
					{link.clicks.toLocaleString()}
				</Badge>
				<div className="flex items-center space-x-2">
					<Switch
						checked={link.active}
						id={`switch-${link.id}`}
						onCheckedChange={(checked) => onToggleActive(link.id, checked)}
					/>
					<Label className="cursor-pointer" htmlFor={`switch-${link.id}`}>
						{link.active ? "Ativo" : "Inativo"}
					</Label>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button className="h-8 w-8" size="icon" variant="ghost">
							<span className="sr-only">Mais opções</span>
							{/* checar o aria-hidden */}
							<svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
								<circle cx="5" cy="12" r="2" />
								<circle cx="12" cy="12" r="2" />
								<circle cx="19" cy="12" r="2" />
							</svg>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => onStartEditing(link.id)}>
							<Edit className="mr-2 h-4 w-4" /> Editar
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onArchiveLink(link.id)}>
							<ArchiveBox className="mr-2 h-4 w-4" /> Arquivar
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onToggleSensitive(link.id)}>
							{link.sensitive ? (
								<>
									<Eye className="mr-2 h-4 w-4" /> Conteúdo não Sensível
								</>
							) : (
								<>
									<EyeOff className="mr-2 h-4 w-4" /> Conteúdo Sensível
								</>
							)}
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => onDeleteLink(link.id)}>
							<Trash2 className="mr-2 h-4 w-4 text-destructive" /> Excluir
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</article>
	);
};

export default LinkCard;
