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
import { getIconForUrl } from "./links.helpers";
import type { LinkItem } from "./links.types";

interface LinkCardProps {
	link: LinkItem;
	// biome-ignore lint/suspicious/noExplicitAny: Aqui se pede para renomear any para outro tipo, mas qualquer tipo quebra o resto do código #analisar
	listeners: any;
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
				"transition-all flex flex-col gap-2 sm:gap-4 border-2 rounded-lg p-2 sm:p-4",
				"sm:flex-row sm:items-center",
				link.sensitive && "border-rose-400",
			)}
		>
			<div className="flex items-center gap-2 sm:gap-3 sm:w-7/12">
				<Grip
					{...listeners}
					className="h-5 w-5 cursor-move text-muted-foreground"
				/>
				<div className="flex-1 space-y-1">
					{link.isEditing ? (
						<section className="space-y-2">
							<input
								type="text"
								className="w-full border rounded px-2 py-1"
								value={link.title}
								onChange={(e) => onLinkChange(link.id, "title", e.target.value)}
							/>
							<input
								type="url"
								className="w-full border rounded px-2 py-1"
								value={link.url}
								onChange={(e) => onLinkChange(link.id, "url", e.target.value)}
							/>
							<div className="flex gap-2">
								<Button
									onClick={() => onSaveEditing(link.id, link.title, link.url)}
								>
									Salvar
								</Button>
								<Button
									variant="outline"
									onClick={() => onCancelEditing(link.id)}
								>
									Cancelar
								</Button>
							</div>
						</section>
					) : (
						<>
							<header className="flex items-center gap-2">
								<h3 className="font-medium flex items-center gap-1">
									<span className="mt-0.5">{getIconForUrl(link.url)}</span>
									{link.title.length > 26
										? `${link.title.slice(0, 26)}...`
										: link.title}
								</h3>
							</header>
							<section className="flex items-center gap-1 text-sm text-blue-500">
								<ExternalLink className="h-3 w-3" />
								<Link
									className="truncate max-w-[200px]"
									href={link.url}
									target="_blank"
									rel="noopener noreferrer"
									onClick={() => onClickLink(link.id)}
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
				<Badge variant="secondary" className="flex items-center gap-1">
					<MousePointerClick className="h-3 w-3" />
					{link.clicks.toLocaleString()}
				</Badge>
				<div className="flex items-center space-x-2">
					<Switch
						checked={link.active}
						onCheckedChange={(checked) => onToggleActive(link.id, checked)}
						id={`switch-${link.id}`}
					/>
					<Label htmlFor={`switch-${link.id}`} className="cursor-pointer">
						{link.active ? "Ativo" : "Inativo"}
					</Label>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="h-8 w-8">
							<span className="sr-only">Mais opções</span>
							{/* checar o aria-hidden */}
							<svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
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
