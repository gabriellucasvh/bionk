"use client";

import { format } from "date-fns";
import {
	Calendar as CalendarIcon,
	Clock,
	Lock,
	MoreVertical,
	Tags,
} from "lucide-react";
import { useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { SectionItem } from "../types/links.types";

// Tipos e Interfaces
type LinkFormData = {
	title: string;
	url: string;
	sectionId?: number | null;
	badge: string;
	password?: string;
	expiresAt?: Date;
	deleteOnClicks?: number;
	launchesAt?: Date;
	shareAllowed?: boolean;
};

interface AddNewLinkFormProps {
	formData?: LinkFormData;
	setFormData?: (data: LinkFormData) => void;
	onSave?: () => void;
	isSaveDisabled?: boolean;
	existingSections?: SectionItem[];
	linksManager?: {
		isAdding: boolean;
		formData: LinkFormData;
		setIsAdding: (isAdding: boolean) => void;
		setFormData: (data: LinkFormData) => void;
		existingSections: SectionItem[];
		handleAddNewLink: () => void;
	};
}

type PanelProps = {
	formData: LinkFormData;
	setFormData: (data: LinkFormData) => void;
};

// --- Subcomponentes para cada painel de opção ---

const BadgePanel = ({ formData, setFormData }: PanelProps) => (
	<div className="grid gap-2 rounded-md border bg-background/50 p-3">
		<Label htmlFor="badge">Texto do Badge</Label>
		<Input
			id="badge"
			maxLength={12}
			onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
			placeholder="Ex: PROMO"
			value={formData.badge}
		/>
		<p className="mt-1 text-muted-foreground text-xs">
			Máximo de 12 caracteres.
		</p>
	</div>
);

// Painéis específicos para cada opção avançada
const PasswordPanel = ({ formData, setFormData }: PanelProps) => (
	<div className="grid gap-2 rounded-md border bg-background/50 p-3">
		<Label htmlFor="password">Senha de Acesso</Label>
		<Input
			id="password"
			maxLength={20}
			onChange={(e) => setFormData({ ...formData, password: e.target.value })}
			placeholder="••••••••"
			type="password"
			value={formData.password || ""}
		/>
	</div>
);

const ClicksPanel = ({ formData, setFormData }: PanelProps) => (
	<div className="grid gap-2 rounded-md border bg-background/50 p-3">
		<Label htmlFor="deleteOnClicks">Excluir após X cliques</Label>
		<Input
			id="deleteOnClicks"
			inputMode="numeric"
			max={999_999}
			min={1}
			onChange={(e) => {
				const raw = e.target.value.replace(/\D/g, "").slice(0, 6);
				setFormData({
					...formData,
					deleteOnClicks: raw ? Math.max(1, Number(raw)) : undefined,
				});
			}}
			pattern="[0-9]*"
			placeholder="Ex: 100"
			type="text"
			value={(formData.deleteOnClicks ?? "").toString()}
		/>
	</div>
);

const ExpirePanel = ({ formData, setFormData }: PanelProps) => (
	<div className="grid gap-2 rounded-md border bg-background/50 p-3">
		<Label className="mb-2">Data de Expiração</Label>
		<Popover>
			<PopoverTrigger asChild>
				<Button
					className={cn(
						"w-full justify-start text-left font-normal",
						!formData.expiresAt && "text-muted-foreground"
					)}
					variant="outline"
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{formData.expiresAt ? (
						format(formData.expiresAt, "PPP")
					) : (
						<span>Escolha uma data</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="z-[60] w-auto p-0">
				<Calendar
					disabled={{ before: new Date() }}
					initialFocus
					mode="single"
					onSelect={(date) => setFormData({ ...formData, expiresAt: date })}
					selected={formData.expiresAt}
				/>
			</PopoverContent>
		</Popover>
	</div>
);

// --- Componente Principal ---
const AddNewLinkForm = (props: AddNewLinkFormProps) => {
	// Use linksManager props if available, otherwise use direct props
	const formData = props.linksManager?.formData ||
		props.formData || {
			title: "",
			url: "",
			sectionId: null,
			badge: "",
		};
	const setFormData =
		props.linksManager?.setFormData || props.setFormData || (() => null);
	const onSave =
		props.linksManager?.handleAddNewLink ||
		props.onSave ||
		(() => Promise.resolve());
	const isSaveDisabled = props.isSaveDisabled ?? false;

	const [isLoading, setIsLoading] = useState(false);
	// Estados de toggle das opções avançadas
	const [passwordEnabled, setPasswordEnabled] = useState(false);
	const [expiresEnabled, setExpiresEnabled] = useState(false);
	const [deleteClicksEnabled, setDeleteClicksEnabled] = useState(false);
	const [badgeEnabled, setBadgeEnabled] = useState(false);

	const handleSave = async () => {
		setIsLoading(true);
		try {
			await onSave();
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex h-full flex-col space-y-4">
			<div className="flex-1 space-y-3 overflow-y-auto">
				<section className="space-y-3 rounded-lg border bg-muted/90 p-4">
					{/* Campos Principais */}
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="title">Título *</Label>
							<Input
								className="bg-white dark:bg-[#202020]"
								id="title"
								maxLength={80}
								onChange={(e) =>
									setFormData({ ...formData, title: e.target.value })
								}
								placeholder="Ex: Meu Portfólio"
								value={formData.title}
							/>
							<p className="mt-1 text-muted-foreground text-xs">
								{formData.title.length}/80 caracteres
							</p>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="url">URL *</Label>
							<Input
								className="bg-white dark:bg-[#202020]"
								id="url"
								onChange={(e) =>
									setFormData({ ...formData, url: e.target.value })
								}
								placeholder="https://exemplo.com"
								type="url"
								value={formData.url}
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
						<div className="flex items-start justify-between gap-3">
							<div className="flex items-start gap-3">
								<Lock className="mt-0.5 h-5 w-5" />
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
										setFormData({ ...formData, password: "" });
									}
								}}
							/>
						</div>
						{passwordEnabled && (
							<div className="mt-2">
								<PasswordPanel formData={formData} setFormData={setFormData} />
							</div>
						)}
					</div>

					{/* Data de Expiração */}
					<div className="rounded-md border p-3">
						<div className="flex items-start justify-between gap-3">
							<div className="flex items-start gap-3">
								<Clock className="mt-0.5 h-5 w-5" />
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
										setFormData({ ...formData, expiresAt: undefined });
									}
								}}
							/>
						</div>
						{expiresEnabled && (
							<div className="mt-2">
								<ExpirePanel formData={formData} setFormData={setFormData} />
								<div className="mt-3 flex items-start justify-between gap-3 rounded-md border bg-background/50 p-3">
									<div className="flex items-start gap-3">
										<MoreVertical className="mt-0.5 h-5 w-5" />
										<div>
											<div className="font-medium">
												Permitir compartilhamento
											</div>
										</div>
									</div>
									<Switch
										checked={!!formData.shareAllowed}
										onCheckedChange={(v) => {
											setFormData({ ...formData, shareAllowed: v });
										}}
									/>
								</div>
							</div>
						)}
					</div>

					{/* Limite de Cliques */}
					<div className="rounded-md border p-3">
						<div className="flex items-start justify-between gap-3">
							<div className="flex items-start gap-3">
								<Tags className="mt-0.5 h-5 w-5" />
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
										setFormData({ ...formData, deleteOnClicks: undefined });
									}
								}}
							/>
						</div>
						{deleteClicksEnabled && (
							<div className="mt-2">
								<ClicksPanel formData={formData} setFormData={setFormData} />
								<div className="mt-3 flex items-start justify-between gap-3 rounded-md border bg-background/50 p-3">
									<div className="flex items-start gap-3">
										<MoreVertical className="mt-0.5 h-5 w-5" />
										<div>
											<div className="font-medium">
												Permitir compartilhamento
											</div>
										</div>
									</div>
									<Switch
										checked={!!formData.shareAllowed}
										onCheckedChange={(v) => {
											setFormData({ ...formData, shareAllowed: v });
										}}
									/>
								</div>
							</div>
						)}
					</div>

					{/* Adicionar Badge */}
					<div className="rounded-md border p-3">
						<div className="flex items-start justify-between gap-3">
							<div className="flex items-start gap-3">
								<Tags className="mt-0.5 h-5 w-5" />
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
										setFormData({ ...formData, badge: "" });
									}
								}}
							/>
						</div>
						{badgeEnabled && (
							<div className="mt-2">
								<BadgePanel formData={formData} setFormData={setFormData} />
							</div>
						)}
					</div>
				</section>
			</div>

			{/* Botão de Ação Fixo */}
			<div className="flex-shrink-0 border-t pt-3">
				<BaseButton
					className="w-full"
					disabled={isSaveDisabled}
					loading={isLoading}
					onClick={handleSave}
				>
					Salvar 
				</BaseButton>
			</div>
		</div>
	);
};

export default AddNewLinkForm;
