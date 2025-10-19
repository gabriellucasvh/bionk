"use client";

import { useRef } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";

interface ColorPreviewItemProps {
	label: string;
	color: string;
	colorKey: string;
	activeColorPicker: string | null;
	setActiveColorPicker: (picker: string | null) => void;
	handleChange: (field: string, value: string) => void;
	debouncedHandleChange: (field: string, value: string) => void;
	fieldName: string;
}

interface ColorPreviewsProps {
	customizations: Record<string, string>;
	activeColorPicker: string | null;
	setActiveColorPicker: (picker: string | null) => void;
	handleChange: (field: string, value: string) => void;
	debouncedHandleChange: (field: string, value: string) => void;
}

function ColorPreviewItem({
	label,
	color,
	colorKey,
	activeColorPicker,
	setActiveColorPicker,
	handleChange,
	debouncedHandleChange,
	fieldName,
}: ColorPreviewItemProps) {
	const pickerRef = useRef<HTMLDivElement>(null);
	const previewColorKey = `preview-${colorKey}`;

	return (
		<div className="rounded-lg p-2">
			<div className="flex items-center gap-3">
				<button
					className="h-8 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-zinc-200 transition-colors hover:border-blue-500 dark:border-zinc-600"
					data-color-button
					onClick={() =>
						setActiveColorPicker(
							activeColorPicker === previewColorKey ? null : previewColorKey
						)
					}
					style={{ backgroundColor: color }}
					type="button"
				/>
				<div className="flex-1">
					<p className="font-medium text-sm">{label}</p>
					<p className="text-xs text-zinc-600 dark:text-zinc-400">{color}</p>
				</div>
			</div>
			{activeColorPicker === previewColorKey && (
				<div className="mt-3 w-min" data-color-picker ref={pickerRef}>
					<HexColorPicker
						color={color}
						onChange={(newColor) => debouncedHandleChange(fieldName, newColor)}
					/>
					<HexColorInput
						className="mt-2 w-full rounded border border-zinc-300 p-2 text-center dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
						color={color}
						onChange={(newColor) => handleChange(fieldName, newColor)}
						placeholder="#000000"
					/>
				</div>
			)}
		</div>
	);
}

export function ColorPreviews({
	customizations,
	activeColorPicker,
	setActiveColorPicker,
	handleChange,
	debouncedHandleChange,
}: ColorPreviewsProps) {
	const hasCustomColors = !!(
		customizations.customBackgroundColor ||
		customizations.customBackgroundGradient ||
		customizations.customTextColor ||
		customizations.customButtonColor ||
		customizations.customButtonTextColor
	);

	if (!hasCustomColors) {
		return (
			<div className="py-8 text-center text-zinc-500 dark:text-zinc-400">
				<p className="text-sm">Nenhuma cor personalizada selecionada</p>
				<p className="mt-1 text-xs">
					Configure suas cores nas seções acima para vê-las aqui
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{/* Cor de Fundo */}
			{customizations.customBackgroundColor && (
				<ColorPreviewItem
					activeColorPicker={activeColorPicker}
					color={customizations.customBackgroundColor}
					colorKey="customBackgroundColor"
					debouncedHandleChange={debouncedHandleChange}
					fieldName="customBackgroundColor"
					handleChange={handleChange}
					label="Cor de Fundo"
					setActiveColorPicker={setActiveColorPicker}
				/>
			)}

			{/* Cor do Texto */}
			{customizations.customTextColor && (
				<ColorPreviewItem
					activeColorPicker={activeColorPicker}
					color={customizations.customTextColor}
					colorKey="customTextColor"
					debouncedHandleChange={debouncedHandleChange}
					fieldName="customTextColor"
					handleChange={handleChange}
					label="Cor do Texto e Ícones"
					setActiveColorPicker={setActiveColorPicker}
				/>
			)}

			{/* Cor do Botão */}
			{customizations.customButtonColor && (
				<ColorPreviewItem
					activeColorPicker={activeColorPicker}
					color={customizations.customButtonColor}
					colorKey="customButtonColor"
					debouncedHandleChange={debouncedHandleChange}
					fieldName="customButtonColor"
					handleChange={handleChange}
					label="Cor do Botão"
					setActiveColorPicker={setActiveColorPicker}
				/>
			)}

			{/* Cor do Texto do Botão */}
			{customizations.customButtonTextColor && (
				<ColorPreviewItem
					activeColorPicker={activeColorPicker}
					color={customizations.customButtonTextColor}
					colorKey="customButtonTextColor"
					debouncedHandleChange={debouncedHandleChange}
					fieldName="customButtonTextColor"
					handleChange={handleChange}
					label="Cor do Texto do Botão"
					setActiveColorPicker={setActiveColorPicker}
				/>
			)}
		</div>
	);
}
