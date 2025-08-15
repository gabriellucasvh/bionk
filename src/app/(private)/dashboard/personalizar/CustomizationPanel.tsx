// src/app/(private)/dashboard/personalizar/CustomizationPanel.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";
import { HexColorPicker } from "react-colorful";

// Interface atualizada - onSave agora recebe apenas as mudanças
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

	// Função para salvar uma mudança individual imediatamente
	const handleChangeAndSave = async (
		field: keyof typeof customizations,
		value: string
	) => {
		const changeToSave: Partial<typeof customizations> = { [field]: value };

		// Lógica de limpeza de campos conflitantes
		if (field === "customBackgroundColor" && value) {
			changeToSave.customBackgroundGradient = "";
		}
		if (field === "customBackgroundGradient" && value) {
			changeToSave.customBackgroundColor = "";
		}

		// Atualiza o estado local
		setCustomizations((prev) => ({
			...prev,
			...changeToSave,
		}));

		// Salva imediatamente apenas as mudanças
		await onSave(changeToSave);
		// Opcionalmente, reverter o estado local em caso de erro
	};

	// Alternativa: Acumular mudanças para salvar em lote
	const handleChange = (field: keyof typeof customizations, value: string) => {
		const newChange = { [field]: value };

		// Lógica de limpeza
		if (field === "customBackgroundColor" && value) {
			newChange.customBackgroundGradient = "";
		}
		if (field === "customBackgroundGradient" && value) {
			newChange.customBackgroundColor = "";
		}

		setCustomizations((prev) => ({
			...prev,
			...newChange,
		}));

		setPendingChanges((prev) => ({
			...prev,
			...newChange,
		}));
	};

	const handleSavePending = async () => {
		if (Object.keys(pendingChanges).length === 0) {
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

	const hasPendingChanges = Object.keys(pendingChanges).length > 0;

	return (
		<div className="mt-8">
			{/* Cor de Fundo */}
			<div className="mb-8">
				<Label className="mb-3 block">Cor de Fundo</Label>
				<div className="mb-3 flex gap-1">
					<button
						className="flex h-10 w-10 items-center justify-center rounded-full"
						onClick={() =>
							setActiveColorPicker(
								activeColorPicker === "background" ? null : "background"
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
								customizations.customBackgroundColor === color
									? "border-blue-500"
									: "border-gray-200 hover:border-blue-500"
							}`}
							key={color}
							// Opção 1: Salvar imediatamente
							onClick={() =>
								handleChangeAndSave("customBackgroundColor", color)
							}
							// Opção 2: Acumular para salvar depois
							// onClick={() => handleChange("customBackgroundColor", color)}
							style={{ backgroundColor: color }}
							type="button"
						/>
					))}
				</div>

				{activeColorPicker === "background" && (
					<div className="mt-3">
						<HexColorPicker
							color={customizations.customBackgroundColor}
							// Usando debounce seria ideal aqui para evitar muitas chamadas
							onChange={(color) => handleChange("customBackgroundColor", color)}
						/>
						<div className="mt-2 text-gray-500 text-xs">
							{customizations.customBackgroundColor}
						</div>
					</div>
				)}
			</div>

			{/* Gradiente de Fundo */}
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
							onClick={() =>
								handleChangeAndSave("customBackgroundGradient", gradient)
							}
							style={{ background: gradient }}
							type="button"
						/>
					))}
				</div>
			</div>

			{/* Cor do Texto */}
			<div className="mb-8">
				<Label className="mb-3 block">Cor do Texto</Label>
				<div className="mb-3 flex gap-1">
					{SOLID_COLORS.map((color) => (
						<button
							className={`h-10 w-10 rounded-full border-2 transition-all duration-300 ${
								customizations.customTextColor === color
									? "border-blue-500"
									: "border-gray-200 hover:border-blue-500"
							}`}
							key={color}
							onClick={() => handleChangeAndSave("customTextColor", color)}
							style={{ backgroundColor: color }}
							type="button"
						/>
					))}
				</div>
				<button
					className="text-blue-600 text-sm hover:underline"
					onClick={() =>
						setActiveColorPicker(activeColorPicker === "text" ? null : "text")
					}
					type="button"
				>
					{activeColorPicker === "text" ? "Fechar seletor" : "Seletor avançado"}
				</button>
				{activeColorPicker === "text" && (
					<div className="mt-3">
						<HexColorPicker
							color={customizations.customTextColor}
							onChange={(color) => handleChange("customTextColor", color)}
						/>
						<div className="mt-2 text-gray-500 text-xs">
							{customizations.customTextColor}
						</div>
					</div>
				)}
			</div>

			{/* Cor do Botão */}
			<div className="mb-8">
				<Label className="mb-3 block">Cor do Botão</Label>
				<div className="mb-3 flex gap-1">
					{SOLID_COLORS.map((color) => (
						<button
							className={`h-10 w-10 rounded-full border-2 transition-all duration-300 ${
								customizations.customButtonFill === color
									? "border-blue-500"
									: "border-gray-200 hover:border-blue-500"
							}`}
							key={color}
							onClick={() => handleChangeAndSave("customButtonFill", color)}
							style={{ backgroundColor: color }}
							type="button"
						/>
					))}
				</div>
				<button
					className="text-blue-600 text-sm hover:underline"
					onClick={() =>
						setActiveColorPicker(
							activeColorPicker === "button" ? null : "button"
						)
					}
					type="button"
				>
					{activeColorPicker === "button"
						? "Fechar seletor"
						: "Seletor avançado"}
				</button>
				{activeColorPicker === "button" && (
					<div className="mt-3">
						<HexColorPicker
							color={customizations.customButtonFill}
							onChange={(color) => handleChange("customButtonFill", color)}
						/>
						<div className="mt-2 text-gray-500 text-xs">
							{customizations.customButtonFill}
						</div>
					</div>
				)}
			</div>

			{/* Fonte */}
			<div className="mb-8">
				<Label className="mb-3 block">Fonte</Label>
				<div className="flex gap-1">
					{FONT_OPTIONS.map((font) => (
						<button
							className={`rounded border px-4 py-2 ${customizations.customFont === font.value ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
							key={font.value}
							onClick={() => handleChangeAndSave("customFont", font.value)}
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
				<div className="flex gap-1">
					{BUTTON_STYLES.map((style) => (
						<button
							className={`rounded border px-4 py-2 ${customizations.customButton === style.value ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
							key={style.value}
							onClick={() => handleChangeAndSave("customButton", style.value)}
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
				<div className="flex gap-1">
					{BUTTON_CORNERS.map((radius) => (
						<button
							className={`rounded border px-4 py-2 ${customizations.customButtonCorners === radius ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
							key={radius}
							onClick={() => handleChangeAndSave("customButtonCorners", radius)}
							type="button"
						>
							{radius}px
						</button>
					))}
				</div>
			</div>

			{/* Botão de salvar pendências (opcional) */}
			{hasPendingChanges && (
				<div className="mb-4 flex justify-end">
					<div className="rounded border border-yellow-200 bg-yellow-50 p-3">
						<p className="mb-2 text-sm text-yellow-700">
							Você tem mudanças não salvas
						</p>
						<Button disabled={isSaving} onClick={handleSavePending} size="sm">
							{isSaving ? "Salvando..." : "Salvar Mudanças"}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
