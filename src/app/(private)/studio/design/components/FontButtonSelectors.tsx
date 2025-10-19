"use client";

import { Check, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { BUTTON_STYLES, FONT_OPTIONS } from "../constants/design.constants";
import { RenderLabel } from "./design.RenderLabel";

interface FontSelectorProps {
	customizations: Record<string, string>;
	handleChange: (field: string, value: string) => void;
	setIsFontModalOpen: (open: boolean) => void;
}

interface ButtonStyleSelectorProps {
	customizations: Record<string, string>;
	handleChange: (field: string, value: string) => void;
	hasPendingChange: (field: string) => boolean;
}

interface ButtonCornersSelectorProps {
	customizations: Record<string, string>;
	handleChange: (field: string, value: string) => void;
	hasPendingChange: (field: string) => boolean;
}

function getCornerLabel(value: number): string {
	switch (value) {
		case 0:
			return "Quadrado";
		case 12:
			return "Padrão";
		case 24:
			return "Arredondado";
		case 36:
			return "Circular";
		default:
			return "Padrão";
	}
}

export function FontSelector({
	customizations,
	handleChange,
	setIsFontModalOpen,
}: FontSelectorProps) {
	return (
		<div>
			<RenderLabel text="Fonte" />
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
			<div className="mt-2 hidden grid-cols-3 gap-2 sm:grid sm:grid-cols-4 lg:grid-cols-5">
				{FONT_OPTIONS.map((font) => (
					<button
						className={`flex h-16 w-full items-center justify-center rounded border px-2 py-1 text-center text-xs leading-tight transition-colors ${
							customizations.customFont === font.value
								? "border-zinc-300 bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-700"
								: "border-zinc-200 hover:bg-zinc-200 dark:border-zinc-600 dark:text-white dark:hover:bg-zinc-700"
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
	);
}

export function ButtonStyleSelector({
	customizations,
	handleChange,
	hasPendingChange,
}: ButtonStyleSelectorProps) {
	return (
		<div>
			<RenderLabel
				hasPending={hasPendingChange("customButtonStyle")}
				text="Estilo do Botão"
			/>
			<div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-3">
				{BUTTON_STYLES.map((style) => {
					const isActive = customizations.customButtonStyle === style.value;
					return (
						<div
							className={`relative min-h-12 w-full cursor-pointer rounded-lg transition-all ${
								isActive ? "" : "hover:bg-zinc-50 dark:hover:bg-zinc-600"
							}`}
							key={style.value}
							onClick={() => handleChange("customButtonStyle", style.value)}
							role="none"
						>
							{isActive && (
								<div className="absolute top-1 left-1 rounded-full bg-green-600 p-1 text-white shadow-sm">
									<Check className="h-3 w-3" />
								</div>
							)}
							<button
								className={`flex h-12 w-full items-center justify-center rounded px-2 py-1 text-center text-sm transition-all duration-200 ${style.preview}`}
								type="button"
							>
								{style.label}
							</button>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export function ButtonCornersSelector({
	customizations,
	handleChange,
	hasPendingChange,
}: ButtonCornersSelectorProps) {
	return (
		<div>
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
						Number.parseInt(customizations.customButtonCorners || "12", 10),
					]}
				/>
				<span className="w-20 text-center font-semibold text-zinc-700 dark:text-zinc-300">
					{getCornerLabel(
						Number.parseInt(customizations.customButtonCorners || "12", 10)
					)}
				</span>
			</div>
		</div>
	);
}
