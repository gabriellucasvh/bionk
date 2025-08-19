"use client";

import { BaseButton } from "@/components/buttons/BaseButton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
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

	useEffect(() => {
		setCustomizations(userCustomizations);
		setPendingChanges({});
	}, [userCustomizations]);

	const handleChange = (field: keyof typeof customizations, value: string) => {
		const newValue = value;
		setCustomizations((prev) => ({ ...prev, [field]: newValue }));

		// Se o valor voltou ao original, remove do pendingChanges
		if (newValue === userCustomizations[field]) {
			setPendingChanges((prev) => {
				const updated = { ...prev };
				delete updated[field];
				return updated;
			});
		} else {
			setPendingChanges((prev) => ({ ...prev, [field]: newValue }));
		}
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

	// Nova função para cancelar as alterações
	const handleCancel = () => {
		setCustomizations(userCustomizations);
		setPendingChanges({});
	};

	// Função auxiliar para verificar se um campo tem alterações pendentes
	const hasPendingChange = (field: keyof typeof customizations) =>
		pendingChanges[field] !== undefined &&
		customizations[field] !== userCustomizations[field];

	const renderColorSelector = (
		field: "customBackgroundColor" | "customTextColor" | "customButtonFill",
		label: string
	) => (
		<div className="mb-8">
			{/* Agora passamos a prop 'hasPending' diretamente */}
			<RenderLabel hasPending={hasPendingChange(field)} text={label} />
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
								? "border-2 border-lime-700"
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
				<RenderLabel
					hasPending={hasPendingChange("customBackgroundGradient")}
					text="Gradiente de Fundo"
				/>
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
				<RenderLabel hasPending={hasPendingChange("customFont")} text="Fonte" />
				<div className="flex flex-wrap gap-2">
					{FONT_OPTIONS.map((font) => (
						<button
							className={`whitespace-nowrap rounded border px-4 py-2 transition-colors ${
								customizations.customFont === font.value
									? "border-gray-300 bg-neutral-200"
									: "border-gray-200 hover:bg-neutral-200"
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
				<RenderLabel
					hasPending={hasPendingChange("customButton")}
					text="Estilo do Botão"
				/>
				<div className="flex flex-wrap gap-2">
					{BUTTON_STYLES.map((style) => (
						<button
							className={`whitespace-nowrap rounded border px-4 py-2 transition-colors ${
								customizations.customButton === style.value
									? "border-gray-300 bg-neutral-200"
									: "border-gray-200 hover:bg-neutral-200"
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
			<div className="mb-12">
				<RenderLabel
					hasPending={hasPendingChange("customButtonCorners")}
					text="Cantos do Botão"
				/>
				<div className="flex flex-wrap gap-2">
					{BUTTON_CORNERS.map((radius) => (
						<button
							className={`whitespace-nowrap rounded border px-4 py-2 transition-colors ${
								customizations.customButtonCorners === radius
									? "border-gray-300 bg-neutral-200"
									: "border-gray-200 hover:bg-neutral-200"
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

			{/* Salvar e Cancelar pendências */}
			{Object.keys(pendingChanges).length > 0 && (
				<div className="mb-12 flex items-center gap-2">
					<BaseButton loading={isSaving} onClick={handleSavePending} size="sm">
						Salvar
					</BaseButton>
					<BaseButton
						loading={isSaving}
						onClick={handleCancel}
						size="sm"
						variant="white"
					>
						Cancelar
					</BaseButton>
				</div>
			)}
		</div>
	);
}
