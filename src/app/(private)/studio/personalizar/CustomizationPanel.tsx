"use client";

import { Plus, Type } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { BaseButton } from "@/components/buttons/BaseButton";
import FontSelectionModal from "@/components/modals/FontSelectionModal";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider"; // Importar o Slider do shadcn/ui
import { RenderLabel } from "./components/personalizar.RenderLabel";

// Interface atualizada
interface CustomizationPanelProps {
	userCustomizations: {
		customBackgroundColor: string;
		customBackgroundGradient: string;
		customTextColor: string;
		customFont: string;
		customButton: string;
		customButtonFill: string;
		customButtonCorners: string;
	};
	onSave: (
		partialCustomizations: Partial<{
			customBackgroundColor: string;
			customBackgroundGradient: string;
			customTextColor: string;
			customFont: string;
			customButton: string;
			customButtonFill: string;
			customButtonCorners: string;
		}>
	) => void;
}

const SOLID_COLORS = [
	"#FFFFFF",
	"#000000",
	"#3B82F6",
	"#10B981",
	"#F59E0B",
	"#EF4444",
];
const GRADIENTS = [
	// Gradientes Claros Profissionais
	"linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
	"linear-gradient(135deg, #ffecd2 0%, #fcb69f 25%, #ff8a80 75%, #ff5722 100%)",
	"linear-gradient(135deg, #a8edea 0%, #fed6e3 25%, #d299c2 75%, #fef9d7 100%)",
	"linear-gradient(135deg, #d9a7c7 0%, #fffcdc 25%, #c2e9fb 50%, #a1c4fd 100%)",
	// Gradientes Escuros Sofisticados
	"linear-gradient(135deg, #0c0c0c 0%, #2c3e50 25%, #34495e 75%, #1a252f 100%)",
	"linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 100%)",
	"linear-gradient(135deg, #8360c3 0%, #2ebf91 25%, #8360c3 50%, #2ebf91 100%)",
	"linear-gradient(135deg, #0f0c29 0%, #302b63 25%, #24243e 50%, #0f0c29 100%)",
];
const FONT_OPTIONS = [
	{ value: "font-sans", label: "Satoshi", fontFamily: "var(--font-sans)" },
	{ value: "font-inter", label: "Inter", fontFamily: "var(--font-inter)" },
	{
		value: "font-montserrat",
		label: "Montserrat",
		fontFamily: "var(--font-montserrat)",
	},
	{
		value: "font-poppins",
		label: "Poppins",
		fontFamily: "var(--font-poppins)",
	},
	{ value: "font-nunito", label: "Nunito", fontFamily: "var(--font-nunito)" },
	{
		value: "font-playfair-display",
		label: "Playfair Display",
		fontFamily: "var(--font-playfair-display)",
	},
	{
		value: "font-merriweather",
		label: "Merriweather",
		fontFamily: "var(--font-merriweather)",
	},
	{
		value: "font-dancing-script",
		label: "Dancing Script",
		fontFamily: "var(--font-dancing-script)",
	},
	{
		value: "font-dm-serif-display",
		label: "DM Serif Display",
		fontFamily: "var(--font-dm-serif-display)",
	},
	{
		value: "font-orbitron",
		label: "Orbitron",
		fontFamily: "var(--font-orbitron)",
	},
	{
		value: "font-plus-jakarta-sans",
		label: "Plus Jakarta Sans",
		fontFamily: "var(--font-plus-jakarta-sans)",
	},
	{ value: "font-outfit", label: "Outfit", fontFamily: "var(--font-outfit)" },
	{
		value: "font-space-grotesk",
		label: "Space Grotesk",
		fontFamily: "var(--font-space-grotesk)",
	},
	{
		value: "font-libre-baskerville",
		label: "Libre Baskerville",
		fontFamily: "var(--font-libre-baskerville)",
	},
	{
		value: "font-alegreya",
		label: "Alegreya",
		fontFamily: "var(--font-alegreya)",
	},
	{
		value: "font-spectral",
		label: "Spectral",
		fontFamily: "var(--font-spectral)",
	},
	{
		value: "font-urbanist",
		label: "Urbanist",
		fontFamily: "var(--font-urbanist)",
	},
	{ value: "font-karla", label: "Karla", fontFamily: "var(--font-karla)" },
	{
		value: "font-public-sans",
		label: "Public Sans",
		fontFamily: "var(--font-public-sans)",
	},
	{
		value: "font-atkinson-hyperlegible",
		label: "Atkinson Hyperlegible",
		fontFamily: "var(--font-atkinson-hyperlegible)",
	},
	{
		value: "font-fira-sans",
		label: "Fira Sans",
		fontFamily: "var(--font-fira-sans)",
	},
	{ value: "font-mulish", label: "Mulish", fontFamily: "var(--font-mulish)" },
];
const BUTTON_STYLES = [
	{
		value: "solid",
		label: "Sólido",
		preview: "bg-gray-500 text-white border-none",
	},
	{
		value: "outline",
		label: "Contorno",
		preview:
			"bg-transparent text-gray-700 dark:text-white border-gray-500 border-2",
	},
	{
		value: "soft",
		label: "Suave",
		preview: "bg-gray-100 text-gray-700 border-gray-200",
	},
	{
		value: "shadow",
		label: "Sombra",
		preview:
			"bg-gray-100 text-gray-700 border-gray-300 shadow-lg dark:shadow-white/20",
	},
	{
		value: "neon",
		label: "Neon",
		preview:
			"bg-transparent text-gray-700 dark:text-white border-gray-500 border-2 shadow-[0_0_8px_rgba(0,0,0,0.3)]",
	},
	{
		value: "dashed",
		label: "Tracejado",
		preview:
			"bg-transparent text-gray-700 dark:text-white border-gray-500 border-2 border-dashed",
	},
	{
		value: "double",
		label: "Dupla",
		preview:
			"bg-transparent text-gray-700 dark:text-white border-gray-600 border-4 border-double",
	},
	{
		value: "raised",
		label: "Elevado",
		preview:
			"bg-gray-200 text-gray-700 border-gray-400 border-t-2 border-l-2 border-r border-b shadow-inner",
	},
	{
		value: "inset",
		label: "Interno",
		preview:
			"bg-gray-200 text-gray-700 border-gray-400 border-b-2 border-r-2 border-t border-l shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]",
	},
];

const FIELD_TO_PICKER: Record<string, "background" | "text" | "button"> = {
	customBackgroundColor: "background",
	customTextColor: "text",
	customButtonFill: "button",
};

// Hook de debounce agora usa useCallback para estabilidade
const useDebouncedCallback = (
	callback: (...args: any[]) => void,
	delay: number
) => {
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		// Limpa o timeout quando o componente é desmontado
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return useCallback(
		(...args: any[]) => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			timeoutRef.current = setTimeout(() => {
				callback(...args);
			}, delay);
		},
		[callback, delay]
	);
};

export default function CustomizationPanel({
	userCustomizations,
	onSave,
}: CustomizationPanelProps) {
	const [customizations, setCustomizations] = useState(userCustomizations);
	const [activeColorPicker, setActiveColorPicker] = useState<
		"background" | "text" | "button" | null
	>(null);
	const [isFontModalOpen, setIsFontModalOpen] = useState(false);
	const [pendingChanges, setPendingChanges] = useState<
		Partial<typeof customizations>
	>({});
	const [isSaving, setIsSaving] = useState(false);
	const pickerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setCustomizations(userCustomizations);
		setPendingChanges({});
	}, [userCustomizations]);

	const handleChange = (field: keyof typeof customizations, value: string) => {
		const newCustomizations: Partial<typeof customizations> = {
			[field]: value,
		};
		const newPendingChanges: Partial<typeof customizations> = {
			[field]: value,
		};

		// Se uma cor de fundo é escolhida, limpa o gradiente
		if (field === "customBackgroundColor" && value) {
			newCustomizations.customBackgroundGradient = "";
			newPendingChanges.customBackgroundGradient = "";
		}

		// Se um gradiente é escolhido, limpa a cor de fundo
		if (field === "customBackgroundGradient" && value) {
			newCustomizations.customBackgroundColor = "";
			newPendingChanges.customBackgroundColor = "";
		}

		// Atualiza o estado principal
		setCustomizations((prev) => ({
			...prev,
			...newCustomizations,
		}));

		// Atualiza as alterações pendentes
		setPendingChanges((prev) => {
			const updated = { ...prev, ...newPendingChanges };

			// Limpa as alterações pendentes se elas voltarem ao estado original
			for (const key of Object.keys(newPendingChanges) as Array<
				keyof typeof newPendingChanges
			>) {
				if (updated[key] === userCustomizations[key]) {
					delete updated[key];
				}
			}

			return updated;
		});
	};

	const debouncedHandleChange = useDebouncedCallback(handleChange, 300);

	const handleSavePending = async () => {
		if (!Object.keys(pendingChanges).length) {
			return;
		}
		setIsSaving(true);
		try {
			await onSave(pendingChanges);
			setPendingChanges({});
		} finally {
			setIsSaving(false);
		}
	};

	// Nova função para cancelar as alterações
	const handleCancel = () => {
		setCustomizations(userCustomizations);
		setPendingChanges({});
	};

	// Função auxiliar para verificar se um campo tem alterações pendentes
	const hasPendingChange = (field: keyof typeof customizations) => {
		const isPending = pendingChanges[field] !== undefined;
		const hasChanged = customizations[field] !== userCustomizations[field];

		// Se a cor de fundo foi limpa porque um gradiente foi selecionado,
		// não mostre o aviso de pendente para a cor.
		if (
			field === "customBackgroundColor" &&
			!customizations.customBackgroundColor &&
			pendingChanges.customBackgroundGradient !== undefined
		) {
			return false;
		}

		return isPending && hasChanged;
	};

	// Hook para fechar o seletor de cores ao clicar fora
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				pickerRef.current &&
				!pickerRef.current.contains(event.target as Node)
			) {
				setActiveColorPicker(null);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []); // Array de dependências vazio para executar apenas uma vez

	const renderColorSelector = (
		field: "customBackgroundColor" | "customTextColor" | "customButtonFill",
		label: string
	) => {
		const customColor = customizations[field];
		const isSolidColor = SOLID_COLORS.includes(customColor);

		return (
			<div className="mb-8">
				<RenderLabel hasPending={hasPendingChange(field)} text={label} />
				<div className="mt-2 mb-3 flex flex-wrap gap-1">
					<button
						className="flex h-10 w-10 items-center justify-center rounded-full"
						onClick={() =>
							setActiveColorPicker(
								activeColorPicker === FIELD_TO_PICKER[field]
									? null
									: FIELD_TO_PICKER[field]
							)
						}
						style={{
							background:
								"conic-gradient(from 0deg, red, orange, yellow, green, cyan, blue, violet, red)",
						}}
						type="button"
					>
						<span className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
							<Plus className="h-4 w-4" />
						</span>
					</button>
					{!isSolidColor && customColor && (
						<button
							className="h-10 w-10 rounded-full border-2 border-lime-700"
							style={{ backgroundColor: customColor }}
							type="button"
						/>
					)}
					{SOLID_COLORS.map((color) => (
						<button
							className={`h-10 w-10 rounded-full border-2 transition-all duration-300 ${
								customColor === color
									? "border-2 border-lime-700"
									: "border-2 border-gray-200 hover:border-blue-500 dark:border-gray-600 dark:hover:border-blue-400"
							}`}
							key={color}
							onClick={() => handleChange(field, color)}
							style={{ backgroundColor: color }}
							type="button"
						/>
					))}
				</div>

				{activeColorPicker === FIELD_TO_PICKER[field] && (
					<div className="mt-3 w-min" ref={pickerRef}>
						<HexColorPicker
							color={customColor}
							onChange={(color) => debouncedHandleChange(field, color)}
						/>
						<HexColorInput
							className="mt-2 w-full rounded border border-gray-300 p-2 text-center dark:border-gray-600 dark:bg-neutral-700 dark:text-white"
							color={customColor}
							onChange={(color) => handleChange(field, color)}
							placeholder="#000000"
						/>
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="mt-8">
			{renderColorSelector("customBackgroundColor", "Cor de Fundo")}

			<div className="mb-8">
				<RenderLabel
					hasPending={hasPendingChange("customBackgroundGradient")}
					text="Gradiente de Fundo"
				/>
				<div className="mt-2 flex flex-wrap gap-1">
					{GRADIENTS.map((gradient) => (
						<button
							className={`h-10 w-10 rounded-full border-2 transition-all duration-300 ${
								customizations.customBackgroundGradient === gradient
									? "border-blue-500"
									: "border-gray-200 hover:border-blue-500 dark:border-gray-600 dark:hover:border-blue-400"
							}`}
							key={gradient}
							onClick={() => handleChange("customBackgroundGradient", gradient)}
							style={{ background: gradient }}
							type="button"
						/>
					))}
				</div>
			</div>

			{renderColorSelector("customTextColor", "Cor do Texto")}
			{renderColorSelector("customButtonFill", "Cor do Botão")}

			{/* Fonte */}
			<div className="mb-8">
				<RenderLabel text="Fonte" />
				{/* Mobile: Button to open modal */}
				<div className="mt-2 block sm:hidden">
					<Button
						className="h-12 w-full justify-between px-4 py-2 text-left"
						onClick={() => setIsFontModalOpen(true)}
						variant="outline"
					>
						<span className="truncate">
							{FONT_OPTIONS.find((f) => f.value === customizations.customFont)
								?.label || "Satoshi"}
						</span>
						<Type className="h-4 w-4" />
					</Button>
				</div>
				{/* Desktop: Grid layout */}
				<div className="mt-2 hidden grid-cols-3 gap-2 sm:grid sm:grid-cols-4 lg:grid-cols-5">
					{FONT_OPTIONS.map((font) => (
						<button
							className={`flex h-16 w-full items-center justify-center rounded border px-2 py-1 text-center text-xs leading-tight transition-colors ${
								customizations.customFont === font.value
									? "border-gray-300 bg-neutral-200 dark:border-gray-600 dark:bg-neutral-700"
									: "border-gray-200 hover:bg-neutral-200 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
							}`}
							key={font.value}
							onClick={() => handleChange("customFont", font.value)}
							style={{ fontFamily: font.fontFamily || "inherit" }}
							type="button"
						>
							<span className="break-words">{font.label}</span>
						</button>
					))}
				</div>
			</div>

			{/* Estilo do Botão */}
			<div className="mb-8">
				<RenderLabel
					hasPending={hasPendingChange("customButton")}
					text="Estilo do Botão"
				/>
				<div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-3">
					{BUTTON_STYLES.map((style) => (
						<button
							className={`flex h-12 w-full items-center justify-center rounded px-2 py-1 text-center text-sm transition-all duration-200 ${
								style.preview
							} ${
								customizations.customButton === style.value
									? "ring-1 ring-green-500 ring-offset-2"
									: ""
							}`}
							key={style.value}
							onClick={() => handleChange("customButton", style.value)}
							type="button"
						>
							{style.label}
						</button>
					))}
				</div>
			</div>

			{/* Cantos do Botão com Slider do shadcn/ui */}
			<div className="mb-12">
				<RenderLabel
					hasPending={hasPendingChange("customButtonCorners")}
					text="Cantos do Botão"
				/>
				<div className="mt-2 flex items-center gap-4">
					<Slider
						className="w-full"
						max={36}
						min={0}
						onValueChange={(value) =>
							handleChange("customButtonCorners", value[0].toString())
						}
						step={12}
						value={[
							Number.parseInt(customizations.customButtonCorners || "0", 10),
						]}
					/>
					<span className="w-20 text-center font-semibold text-gray-700 dark:text-gray-300">
						{(() => {
							const value = Number.parseInt(
								customizations.customButtonCorners || "0",
								10
							);
							switch (value) {
								case 0:
									return "Reto";
								case 12:
									return "Suave";
								case 24:
									return "Médio";
								case 36:
									return "Arredondado";
								default:
									return `${value}px`;
							}
						})()}
					</span>
				</div>
			</div>

			{/* Salvar e Cancelar pendências */}
			{Object.keys(pendingChanges).length > 0 && (
				<div className="mb-12 flex items-center gap-2">
					<BaseButton
						loading={isSaving}
						onClick={handleCancel}
						size="sm"
						variant="white"
					>
						Cancelar
					</BaseButton>
					<BaseButton loading={isSaving} onClick={handleSavePending} size="sm">
						Salvar
					</BaseButton>
				</div>
			)}
			{/* Font Selection Modal for Mobile */}
			<FontSelectionModal
				fontOptions={FONT_OPTIONS.map((font) => ({
					label: font.label,
					value: font.value,
					fontFamily: font.fontFamily,
				}))}
				isOpen={isFontModalOpen}
				onClose={() => setIsFontModalOpen(false)}
				onFontSelect={(fontValue) => handleChange("customFont", fontValue)}
				selectedFont={customizations.customFont}
			/>
		</div>
	);
}
