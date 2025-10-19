import { FIELD_TO_PICKER } from "../constants/design.constants";

const HEX_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

export function getButtonStyleClasses(buttonStyle: string): string {
	switch (buttonStyle) {
		case "solid":
			return "bg-zinc-500 text-white border-none";
		case "outline":
			return "bg-transparent text-zinc-700 dark:text-white border-zinc-500 border-2";
		case "soft":
			return "bg-zinc-100 text-zinc-700 border-zinc-200";
		case "shadow":
			return "bg-zinc-100 text-zinc-700 border-zinc-300 shadow-lg dark:shadow-white/20";
		case "neon":
			return "bg-transparent text-zinc-700 dark:text-white border-zinc-500 border-2 shadow-[0_0_8px_rgba(0,0,0,0.3)]";
		case "dashed":
			return "bg-transparent text-zinc-700 dark:text-white border-zinc-500 border-2 border-dashed";
		case "double":
			return "bg-transparent text-zinc-700 dark:text-white border-zinc-600 border-4 border-double";
		case "raised":
			return "bg-zinc-200 text-zinc-700 border-zinc-400 border-t-2 border-l-2 border-r border-b shadow-inner";
		case "inset":
			return "bg-zinc-200 text-zinc-700 border-zinc-400 border-b-2 border-r-2 border-t border-l shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]";
		default:
			return "bg-zinc-500 text-white border-none";
	}
}

export function getPickerType(
	field: string
): "background" | "text" | "button" | "buttonText" | null {
	return FIELD_TO_PICKER[field] || null;
}

export function isValidColor(color: string): boolean {
	const s = new Option().style;
	s.color = color;
	return s.color !== "";
}

export function hexToRgb(
	hex: string
): { r: number; g: number; b: number } | null {
	const result = HEX_REGEX.exec(hex);
	return result
		? {
				r: Number.parseInt(result[1], 16),
				g: Number.parseInt(result[2], 16),
				b: Number.parseInt(result[3], 16),
			}
		: null;
}

export function rgbToHex(r: number, g: number, b: number): string {
	const toHex = (n: number) => {
		const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
		return hex.length === 1 ? `0${hex}` : hex;
	};

	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function getContrastColor(backgroundColor: string): string {
	const rgb = hexToRgb(backgroundColor);
	if (!rgb) {
		return "#000000";
	}

	const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
	return brightness > 128 ? "#000000" : "#ffffff";
}

export function truncateText(text: string, maxLength: number): string {
	return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}
