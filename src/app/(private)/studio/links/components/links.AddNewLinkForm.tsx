"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Lock, Tags } from "lucide-react";
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

type ActiveOption = "schedule" | "protect" | "badge";
type PanelProps = {
	formData: LinkFormData;
	setFormData: (data: LinkFormData) => void;
};

// --- Subcomponentes para cada painel de opção ---

const SchedulePanel = ({ formData, setFormData }: PanelProps) => {
	const handleDateChange = (field: "expiresAt" | "launchesAt", date?: Date) => {
		setFormData({ ...formData, [field]: date });
	};
	return (
		<div className="grid grid-cols-1 gap-4 rounded-md border bg-background/50 p-3 sm:grid-cols-2">
			<div>
				<Label className="mb-2">Lançamento Agendado</Label>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							className={cn(
								"w-full justify-start text-left font-normal",
								!formData.launchesAt && "text-muted-foreground"
							)}
							variant="outline"
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{formData.launchesAt ? (
								format(formData.launchesAt, "PPP")
							) : (
								<span>Escolha uma data</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="z-[60] w-auto p-0">
						<Calendar
							initialFocus
							mode="single"
							onSelect={(date) => handleDateChange("launchesAt", date)}
							selected={formData.launchesAt}
						/>
					</PopoverContent>
				</Popover>
			</div>
			<div>
				<Label className="mb-2">Expira em</Label>
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
							initialFocus
							mode="single"
							onSelect={(date) => handleDateChange("expiresAt", date)}
							selected={formData.expiresAt}
						/>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
};

const ProtectPanel = ({ formData, setFormData }: PanelProps) => (
	<div className="grid grid-cols-1 gap-4 rounded-md border bg-background/50 p-3 sm:grid-cols-2">
		<div className="grid gap-2">
			<Label htmlFor="deleteOnClicks">Excluir após X cliques</Label>
			<Input
				id="deleteOnClicks"
				min={1}
				onChange={(e) =>
					setFormData({
						...formData,
						deleteOnClicks:
							Number(e.target.value) >= 1 ? Number(e.target.value) : undefined,
					})
				}
				placeholder="Ex: 100"
				type="number"
				value={formData.deleteOnClicks || ""}
			/>
		</div>
		<div className="grid gap-2">
			<Label htmlFor="password">Senha de Acesso</Label>
			<Input
				id="password"
				onChange={(e) => setFormData({ ...formData, password: e.target.value })}
				placeholder="••••••••"
				type="password"
				value={formData.password || ""}
			/>
		</div>
	</div>
);

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
	const [activeOption, setActiveOption] = useState<ActiveOption | null>(null);

	// Função para limpar os dados do formulário

	const handleSave = async () => {
		setIsLoading(true);
		try {
			await onSave();
		} finally {
			setIsLoading(false);
		}
	};

	const toggleOption = (option: ActiveOption) =>
		setActiveOption(activeOption === option ? null : option);

	const optionPanels: Record<ActiveOption, React.ReactNode> = {
		schedule: <SchedulePanel formData={formData} setFormData={setFormData} />,
		protect: <ProtectPanel formData={formData} setFormData={setFormData} />,
		badge: <BadgePanel formData={formData} setFormData={setFormData} />,
	};

	return (
		<div className="flex h-full flex-col space-y-4">
			<div className="flex-1 space-y-3 overflow-y-auto">
				<section className="space-y-3 rounded-lg border bg-muted/90 p-4">
					{/* Campos Principais */}
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="title">Título do Link</Label>
							<Input
								className="bg-white dark:bg-[#202020]"
								id="title"
								onChange={(e) =>
									setFormData({ ...formData, title: e.target.value })
								}
								placeholder="Ex: Meu Portfólio"
								value={formData.title}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="url">URL</Label>
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
						</div>
					</div>

					{/* Botões de Opções Avançadas */}
					<div className="grid grid-cols-3 gap-2 border-t pt-3">
						<Button
							className="flex h-16 flex-col"
							onClick={() => toggleOption("schedule")}
							variant={activeOption === "schedule" ? "secondary" : "outline"}
						>
							<Clock className="mb-1 h-5 w-5" />{" "}
							<span className="hidden text-xs md:block">Agendar</span>
						</Button>
						<Button
							className="flex h-16 flex-col"
							onClick={() => toggleOption("protect")}
							variant={activeOption === "protect" ? "secondary" : "outline"}
						>
							<Lock className="mb-1 h-5 w-5" />{" "}
							<span className="hidden text-xs md:block">Proteger</span>
						</Button>
						<Button
							className="flex h-16 flex-col"
							onClick={() => toggleOption("badge")}
							variant={activeOption === "badge" ? "secondary" : "outline"}
						>
							<Tags className="mb-1 h-5 w-5" />{" "}
							<span className="hidden text-xs md:block">Badge</span>
						</Button>
					</div>

					{/* Conteúdo das Opções */}
					{activeOption && optionPanels[activeOption]}
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
					Salvar Link
				</BaseButton>
			</div>
		</div>
	);
};

export default AddNewLinkForm;
