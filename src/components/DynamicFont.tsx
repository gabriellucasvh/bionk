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

	// Onest é a nossa fonte local padrão, já carregada globalmente
	if (fontOption.label === "Onest") {
		return null;
	}

	// Montar a URL do Google Fonts
	const fontName = fontOption.label.replace(/ /g, "+");
	const url = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700&display=swap`;

	return (
		<>
			<link
				crossOrigin="anonymous"
				href="https://fonts.googleapis.com"
				rel="preconnect"
			/>
			<link
				crossOrigin="anonymous"
				href="https://fonts.gstatic.com"
				rel="preconnect"
			/>
			<link href={url} precedence="default" rel="stylesheet" />
		</>
	);
}
