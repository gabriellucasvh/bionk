"use client";

import { BaseButton } from "@/components/buttons/BaseButton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";

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
	"linear-gradient(90deg, #FF9A9E 0%, #FAD0C4 100%)",
	"linear-gradient(90deg, #A1C4FD 0%, #C2E9FB 100%)",
	"linear-gradient(90deg, #84FAB0 0%, #8FD3F4 100%)",
	"linear-gradient(90deg, #A6C1EE 0%, #FBC2EB 100%)",
	"linear-gradient(90deg, #FFC3A0 0%, #FFAFBD 100%)",
	"linear-gradient(90deg, #6A11CB 0%, #2575FC 100%)",
	"linear-gradient(90deg, #FDE68A 0%, #FCA5A5 100%)",
	"linear-gradient(90deg, #D1FAE5 0%, #A5B4FC 100%)",
	"linear-gradient(90deg, #FECACA 0%, #FCA5A5 100%)",
];
const FONT_OPTIONS = [
	{ value: "sans-serif", label: "Sans Serif" },
	{ value: "serif", label: "Serif" },
	{ value: "monospace", label: "Monospace" },
	{ value: "cursive", label: "Cursive" },
];
const BUTTON_STYLES = [
	{ value: "solid", label: "Sólido" },
	{ value: "outline", label: "Contorno" },
	{ value: "soft", label: "Suave" },
];
const BUTTON_CORNERS = ["0", "4", "8", "12", "16", "24"];

const FIELD_TO_PICKER: Record<string, "background" | "text" | "button"> = {
	customBackgroundColor: "background",
	customTextColor: "text",
	customButtonFill: "button",
};

// Função debounce customizada
function useDebounce(fn: (...args: any[]) => void, delay: number) {
	const timeout = useRef<NodeJS.Timeout | null>(null);

	return (...args: any[]) => {
		if (timeout.current) {
			clearTimeout(timeout.current);
		}
		timeout.current = setTimeout(() => fn(...args), delay);
	};
}

export default function CustomizationPanel({
	userCustomizations,
	onSave,
}: CustomizationPanelProps) {
	const [customizations, setCustomizations] = useState(userCustomizations);
	const [activeColorPicker, setActiveColorPicker] = useState<
		"background" | "text" | "button" | null
	>(null);
	const [pendingChanges, setPendingChanges] = useState<
		Partial<typeof customizations>
	>({});
	const [isSaving, setIsSaving] = useState(false);

	const handleChange = (field: keyof typeof customizations, value: string) => {
		const newChange: Partial<typeof customizations> = { [field]: value };

		if (field === "customBackgroundColor" && value) {
			newChange.customBackgroundGradient = "";
		}
		if (field === "customBackgroundGradient" && value) {
			newChange.customBackgroundColor = "";
		}

		setCustomizations((prev) => ({ ...prev, ...newChange }));
		setPendingChanges((prev) => ({ ...prev, ...newChange }));
	};

	const debouncedHandleChange = useDebounce(handleChange, 300);

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

	const renderColorSelector = (
		field: keyof typeof customizations,
		label: string
	) => (
		<div className="mb-8">
			<Label className="mb-3 block">{label}</Label>
			<div className="mb-3 flex gap-1">
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
				{SOLID_COLORS.map((color) => (
					<button
						className={`h-10 w-10 rounded-full border-2 transition-all duration-300 ${
							customizations[field] === color
								? "border-blue-500"
								: "border-gray-200 hover:border-blue-500"
						}`}
						key={color}
						onClick={() => handleChange(field, color)}
						style={{ backgroundColor: color }}
						type="button"
					/>
				))}
			</div>

			{activeColorPicker === FIELD_TO_PICKER[field] && (
				<div className="mt-3">
					<HexColorPicker
						color={customizations[field]}
						onChange={(color) => debouncedHandleChange(field, color)}
					/>
					<div className="mt-2 text-gray-500 text-xs">
						{customizations[field]}
					</div>
					<Button
						className="mt-3"
						disabled={isSaving || !Object.keys(pendingChanges).length}
						onClick={handleSavePending}
						size="sm"
					>
						{isSaving ? "Salvando..." : "Salvar Cor"}
					</Button>
				</div>
			)}
		</div>
	);

	return (
		<div className="mt-8">
			{renderColorSelector("customBackgroundColor", "Cor de Fundo")}
			<div className="mb-8">
				<Label className="mb-3 block">Gradiente de Fundo</Label>
				<div className="flex gap-1">
					{GRADIENTS.map((gradient) => (
						<button
							className={`h-10 w-10 rounded-full border-2 transition-all duration-300 ${
								customizations.customBackgroundGradient === gradient
									? "border-blue-500"
									: "border-gray-200 hover:border-blue-500"
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
				<Label className="mb-3 block">Fonte</Label>
				<div className="flex flex-wrap gap-2">
					{FONT_OPTIONS.map((font) => (
						<button
							className={`whitespace-nowrap rounded border px-4 py-2 ${
								customizations.customFont === font.value
									? "border-blue-500 bg-blue-50"
									: "border-gray-200"
							}`}
							key={font.value}
							onClick={() => handleChange("customFont", font.value)}
							type="button"
						>
							{font.label}
						</button>
					))}
				</div>
			</div>

			{/* Estilo do Botão */}
			<div className="mb-8">
				<Label className="mb-3 block">Estilo do Botão</Label>
				<div className="flex flex-wrap gap-2">
					{BUTTON_STYLES.map((style) => (
						<button
							className={`whitespace-nowrap rounded border px-4 py-2 ${
								customizations.customButton === style.value
									? "border-blue-500 bg-blue-50"
									: "border-gray-200"
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

			{/* Cantos do Botão */}
			<div className="mb-8">
				<Label className="mb-3 block">Cantos do Botão</Label>
				<div className="flex flex-wrap gap-2">
					{BUTTON_CORNERS.map((radius) => (
						<button
							className={`whitespace-nowrap rounded border px-4 py-2 ${
								customizations.customButtonCorners === radius
									? "border-blue-500 bg-blue-50"
									: "border-gray-200"
							}`}
							key={radius}
							onClick={() => handleChange("customButtonCorners", radius)}
							type="button"
						>
							{radius}px
						</button>
					))}
				</div>
			</div>

			{/* Salvar pendências */}
			{Object.keys(pendingChanges).length > 0 && (
				<div className="mb-10 flex">
					<BaseButton disabled={isSaving} onClick={handleSavePending} size="sm">
						{isSaving ? "Salvando..." : "Salvar Mudanças"}
					</BaseButton>
				</div>
			)}
		</div>
	);
}
