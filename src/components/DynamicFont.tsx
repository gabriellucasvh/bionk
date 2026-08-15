"use client";

import { FONT_OPTIONS } from "@/app/(private)/studio/design/constants/design.constants";

interface DynamicFontProps {
	fontValue?: string | null;
}

export default function DynamicFont({ fontValue }: DynamicFontProps) {
	if (!fontValue) {
		return null;
	}

	const fontOption = FONT_OPTIONS.find((option) => option.value === fontValue);
	if (!fontOption) {
		return null;
	}

	// Satoshi é a nossa fonte local padrão, já carregada globalmente
	if (fontOption.label === "Satoshi") {
		return null;
	}

	// Montar a URL do Google Fonts
	const fontName = fontOption.label.replace(/ /g, "+");
	const url = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700&display=swap`;

	return <link href={url} rel="stylesheet" />;
}
