"use client";

import { BaseButton } from "@/components/buttons/BaseButton";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
	Calendar as CalendarIcon,
	Check,
	ChevronsUpDown,
	Clock,
	Image as ImageIcon,
	Lock,
	ShoppingCart,
	Tags,
	Type,
} from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";

// Tipos e Interfaces
type LinkFormData = {
	title: string;
	url: string;
	sectionTitle: string;
	badge: string;
	password?: string;
	expiresAt?: Date;
	deleteOnClicks?: number;
	launchesAt?: Date;
	isProduct: boolean;
	price?: number;
	productImageFile?: File;
};

interface AddNewLinkFormProps {
	formData: LinkFormData;
	setFormData: (data: LinkFormData) => void;
	onSave: () => void;
	onCancel: () => void;
	isSaveDisabled: boolean;
	existingSections: string[];
}

type ActiveOption = "schedule" | "protect" | "badge" | "product" | "section";
type PanelProps = Omit<
	AddNewLinkFormProps,
	"onSave" | "onCancel" | "isSaveDisabled"
>;

// --- Subcomponentes para cada painel de opção ---

const SectionPanel = ({
	formData,
	setFormData,
	existingSections,
}: PanelProps) => {
	const [comboboxOpen, setComboboxOpen] = useState(false);
	return (
		<div className="rounded-md border bg-background/50 p-3">
			<Label>Título da Seção (Opcional)</Label>
			<Popover onOpenChange={setComboboxOpen} open={comboboxOpen}>
				<PopoverTrigger asChild>
					<Button
						aria-expanded={comboboxOpen}
						className="w-full justify-between"
						variant="outline"
					>
						{formData.sectionTitle || "Selecionar ou criar seção..."}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[--radix-popover-trigger-width] p-0">
					<Command>
						<CommandInput
							onValueChange={(value) =>
								setFormData({ ...formData, sectionTitle: value })
							}
							placeholder="Buscar ou digitar nova seção..."
						/>
						<CommandEmpty>Nenhuma seção encontrada.</CommandEmpty>
						<CommandGroup>
							{existingSections.map((section) => (
								<CommandItem
									key={section}
									onSelect={(currentValue) => {
										setFormData({
											...formData,
											sectionTitle:
												currentValue === formData.sectionTitle
													? ""
													: currentValue,
										});
										setComboboxOpen(false);
									}}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											formData.sectionTitle === section
												? "opacity-100"
												: "opacity-0"
										)}
									/>
									{section}
								</CommandItem>
							))}
						</CommandGroup>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
};

const SchedulePanel = ({ formData, setFormData }: PanelProps) => {
	const handleDateChange = (field: "expiresAt" | "launchesAt", date?: Date) => {
		setFormData({ ...formData, [field]: date });
	};
	return (
		<div className="grid grid-cols-1 gap-4 rounded-md border bg-background/50 p-3 sm:grid-cols-2">
			<div>
				<Label>Lançamento Agendado</Label>
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
					<PopoverContent className="w-auto p-0">
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
				<Label>Expira em</Label>
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
					<PopoverContent className="w-auto p-0">
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
		<div>
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
		<div>
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
	<div className="rounded-md border bg-background/50 p-3">
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

const ProductPanel = ({ formData, setFormData }: PanelProps) => {
	const imageInputRef = useRef<HTMLInputElement>(null);
	const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 2 * 1024 * 1024) {
				alert("A imagem não pode exceder 2MB.");
				return;
			}
			setFormData({ ...formData, productImageFile: file });
		}
	};
	return (
		<div className="space-y-3 rounded-md border bg-background/50 p-3">
			<div className="flex items-center space-x-2">
				<Switch
					checked={formData.isProduct}
					id="isProduct"
					onCheckedChange={(checked) =>
						setFormData({ ...formData, isProduct: checked })
					}
				/>
				<Label htmlFor="isProduct">Ativar modo Produto (Link-Shop)</Label>
			</div>
			{formData.isProduct && (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<Label htmlFor="price">Preço (R$)</Label>
						<Input
							id="price"
							min={0}
							onChange={(e) =>
								setFormData({
									...formData,
									price:
										Number(e.target.value) >= 0
											? Number(e.target.value)
											: undefined,
								})
							}
							placeholder="Ex: 29.99"
							type="number"
							value={formData.price || ""}
						/>
					</div>
					<div>
						<Label htmlFor="productImage">Imagem do Produto</Label>
						<Input
							accept="image/jpeg, image/png, image/webp"
							className="hidden"
							id="productImage"
							onChange={handleImageSelect}
							ref={imageInputRef}
							type="file"
						/>
						<Button
							className="w-full justify-start text-left font-normal"
							onClick={() => imageInputRef.current?.click()}
							variant="outline"
						>
							<ImageIcon className="mr-2 h-4 w-4" />
							{formData.productImageFile
								? formData.productImageFile.name
								: "Selecionar imagem (até 2MB)"}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

// --- Componente Principal ---
const AddNewLinkForm = (props: AddNewLinkFormProps) => {
	const { formData, onSave, onCancel, isSaveDisabled } = props;
	const [isLoading, setIsLoading] = useState(false);
	const [activeOption, setActiveOption] = useState<ActiveOption | null>(null);

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
		section: <SectionPanel {...props} />,
		schedule: <SchedulePanel {...props} />,
		protect: <ProtectPanel {...props} />,
		badge: <BadgePanel {...props} />,
		product: <ProductPanel {...props} />,
	};

	return (
		<section className="space-y-4 rounded-lg border bg-muted/20 p-4">
			{/* Campos Principais */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div>
					<Label htmlFor="title">Título do Link</Label>
					<Input
						id="title"
						onChange={(e) =>
							props.setFormData({ ...formData, title: e.target.value })
						}
						placeholder="Ex: Meu Portfólio"
						value={formData.title}
					/>
				</div>
				<div>
					<Label htmlFor="url">URL</Label>
					<Input
						id="url"
						onChange={(e) =>
							props.setFormData({ ...formData, url: e.target.value })
						}
						placeholder="https://exemplo.com"
						type="url"
						value={formData.url}
					/>
				</div>
			</div>

			{/* Botões de Opções Avançadas */}
			<div className="grid grid-cols-5 gap-2 border-t pt-4">
				<Button
					className="flex h-16 flex-col"
					onClick={() => toggleOption("section")}
					variant={activeOption === "section" ? "secondary" : "outline"}
				>
					<Type className="mb-1 h-5 w-5" />{" "}
					<span className="text-xs">Seção</span>
				</Button>
				<Button
					className="flex h-16 flex-col"
					onClick={() => toggleOption("schedule")}
					variant={activeOption === "schedule" ? "secondary" : "outline"}
				>
					<Clock className="mb-1 h-5 w-5" />{" "}
					<span className="text-xs">Agendar</span>
				</Button>
				<Button
					className="flex h-16 flex-col"
					onClick={() => toggleOption("protect")}
					variant={activeOption === "protect" ? "secondary" : "outline"}
				>
					<Lock className="mb-1 h-5 w-5" />{" "}
					<span className="text-xs">Proteger</span>
				</Button>
				<Button
					className="flex h-16 flex-col"
					onClick={() => toggleOption("badge")}
					variant={activeOption === "badge" ? "secondary" : "outline"}
				>
					<Tags className="mb-1 h-5 w-5" />{" "}
					<span className="text-xs">Badge</span>
				</Button>
				<Button
					className="flex h-16 flex-col"
					onClick={() => toggleOption("product")}
					variant={activeOption === "product" ? "secondary" : "outline"}
				>
					<ShoppingCart className="mb-1 h-5 w-5" />{" "}
					<span className="text-xs">Produto</span>
				</Button>
			</div>

			{/* Conteúdo das Opções */}
			{activeOption && optionPanels[activeOption]}

			{/* Botões de Ação */}
			<div className="flex gap-2 border-t pt-4">
				<BaseButton
					disabled={isSaveDisabled}
					loading={isLoading}
					onClick={handleSave}
				>
					Salvar Link
				</BaseButton>
				<BaseButton onClick={onCancel} variant="white">
					Cancelar
				</BaseButton>
			</div>
		</section>
	);
};

export default AddNewLinkForm;
