"use client";

import { Plus } from "lucide-react";
import { useRef } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { FIELD_TO_PICKER, SOLID_COLORS } from "../constants/design.constants";
import { RenderLabel } from "./design.RenderLabel";

interface ColorSelectorProps {
	field:
		| "customBackgroundColor"
		| "customTextColor"
		| "customButtonColor"
		| "customButtonTextColor";
	label: string;
	customizations: Record<string, string>;
	activeColorPicker: string | null;
	setActiveColorPicker: (picker: string | null) => void;
	handleChange: (field: string, value: string) => void;
	debouncedHandleChange: (field: string, value: string) => void;
	hasPendingChange: (field: string) => boolean;
}

interface ColorOptionProps {
	color: string;
	field: string;
	isSelected: boolean;
	handleChange: (field: string, value: string) => void;
}

export function ColorOption({
	color,
	field,
	isSelected,
	handleChange,
}: ColorOptionProps) {
	return (
		<button
			className={`h-10 w-10 rounded-full border-2 ${
				isSelected ? "ring-2 ring-black dark:ring-white" : "border-zinc-300 dark:border-zinc-600"
			}`}
			key={color}
			onClick={() => handleChange(field, color)}
			style={{
				background: color,
			}}
			type="button"
		/>
	);
}

export function ColorSelector({
	field,
	label,
	customizations,
	activeColorPicker,
	setActiveColorPicker,
	handleChange,
	debouncedHandleChange,
	hasPendingChange,
}: ColorSelectorProps) {
	const pickerRef = useRef<HTMLDivElement>(null);
	const customColor = customizations[field];
	const isSolidColor = SOLID_COLORS.includes(customColor);

	// Quando selecionamos cor de fundo, limpar opções conflitantes
	const applyChange = (f: string, value: string) => {
		if (f === "customBackgroundColor") {
			handleChange("customBackgroundColor", value);
			handleChange("customBackgroundGradient", "");
			handleChange("customBackgroundMediaType", "");
			handleChange("customBackgroundImageUrl", "");
			handleChange("customBackgroundVideoUrl", "");
		} else {
			handleChange(f, value);
		}
	};

	return (
		<div className="mb-8">
			<RenderLabel hasPending={hasPendingChange(field)} text={label} />
			<div className="mt-2 mb-3 flex flex-wrap gap-1">
				<button
					className="flex h-10 w-10 items-center justify-center rounded-full"
					data-color-button
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
					<ColorOption
						color={color}
						field={field}
						handleChange={applyChange}
						isSelected={customColor === color}
						key={color}
					/>
				))}
			</div>

			{activeColorPicker === FIELD_TO_PICKER[field] && (
				<div className="mt-3 w-min" data-color-picker ref={pickerRef}>
					<HexColorPicker
						color={customColor}
						onChange={(color) => {
							debouncedHandleChange(field, color);
							if (field === "customBackgroundColor") {
								handleChange("customBackgroundGradient", "");
								handleChange("customBackgroundMediaType", "");
								handleChange("customBackgroundImageUrl", "");
								handleChange("customBackgroundVideoUrl", "");
							}
						}}
					/>
					<HexColorInput
						className="mt-2 w-full rounded border border-zinc-300 p-2 text-center dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
						color={customColor}
						onChange={(color) => applyChange(field, color)}
						placeholder="#000000"
						prefixed
					/>
				</div>
			)}
		</div>
	);
}
