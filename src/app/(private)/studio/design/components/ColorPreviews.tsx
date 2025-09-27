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
	fieldName
}: ColorPreviewItemProps) {
	const pickerRef = useRef<HTMLDivElement>(null);
	const previewColorKey = `preview-${colorKey}`;

	return (
		<div className="flex items-center gap-3 rounded-lg p-2">
			<button
				className="h-8 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-neutral-200 transition-colors hover:border-blue-500 dark:border-neutral-600"
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
				<p className="text-neutral-600 text-xs dark:text-neutral-400">
					{color}
				</p>
			</div>
			{activeColorPicker === previewColorKey && (
				<div className="absolute z-10 mt-2" data-color-picker ref={pickerRef}>
					<HexColorPicker
						color={color}
						onChange={(newColor) =>
							debouncedHandleChange(fieldName, newColor)
						}
					/>
					<HexColorInput
						className="mt-2 w-full rounded border border-neutral-300 p-2 text-center dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
						color={color}
						onChange={(newColor) =>
							handleChange(fieldName, newColor)
						}
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
	debouncedHandleChange
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
			<div className="py-8 text-center text-neutral-500 dark:text-neutral-400">
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
					label="Cor de Fundo"
					color={customizations.customBackgroundColor}
					colorKey="customBackgroundColor"
					activeColorPicker={activeColorPicker}
					setActiveColorPicker={setActiveColorPicker}
					handleChange={handleChange}
					debouncedHandleChange={debouncedHandleChange}
					fieldName="customBackgroundColor"
				/>
			)}

			{/* Cor do Texto */}
			{customizations.customTextColor && (
				<ColorPreviewItem
					label="Cor do Texto e Ícones"
					color={customizations.customTextColor}
					colorKey="customTextColor"
					activeColorPicker={activeColorPicker}
					setActiveColorPicker={setActiveColorPicker}
					handleChange={handleChange}
					debouncedHandleChange={debouncedHandleChange}
					fieldName="customTextColor"
				/>
			)}

			{/* Cor do Botão */}
			{customizations.customButtonColor && (
				<ColorPreviewItem
					label="Cor do Botão"
					color={customizations.customButtonColor}
					colorKey="customButtonColor"
					activeColorPicker={activeColorPicker}
					setActiveColorPicker={setActiveColorPicker}
					handleChange={handleChange}
					debouncedHandleChange={debouncedHandleChange}
					fieldName="customButtonColor"
				/>
			)}

			{/* Cor do Texto do Botão */}
			{customizations.customButtonTextColor && (
				<ColorPreviewItem
					label="Cor do Texto do Botão"
					color={customizations.customButtonTextColor}
					colorKey="customButtonTextColor"
					activeColorPicker={activeColorPicker}
					setActiveColorPicker={setActiveColorPicker}
					handleChange={handleChange}
					debouncedHandleChange={debouncedHandleChange}
					fieldName="customButtonTextColor"
				/>
			)}
		</div>
	);
}