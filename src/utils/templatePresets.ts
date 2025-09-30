export interface TemplatePreset {
	customBackgroundColor: string;
	customBackgroundGradient: string;
	customTextColor: string;
	customFont: string;
	customButtonColor: string;
	customButtonTextColor: string;
	customButtonFill: string;
	customButtonCorners: string;
	headerStyle: string;
	customBlurredBackground: boolean;
}

export function getTemplatePreset(templateId: string) {
	switch (templateId) {
		case "default":
			return {
				customBackgroundColor: "",
				customBackgroundGradient:
					"linear-gradient(to bottom, #fafafa, #e5e5e5)",
				customTextColor: "#000000",
				customFont: "font-satoshi",
				customButtonColor: "#ffffff",
				customButtonTextColor: "#000000",
				customButtonStyle: "solid",
				customButtonFill: "filled",
				customButtonCorners: "12",
				headerStyle: "default",
				customBlurredBackground: true,
			};
		case "simple":
			return {
				customBackgroundColor: "#000000",
				customBackgroundGradient: "",
				customTextColor: "#22c55e",
				customFont: "font-satoshi",
				customButtonColor: "#16a34a",
				customButtonTextColor: "#000000",
				customButtonStyle: "solid",
				customButtonFill: "filled",
				customButtonCorners: "12",
				headerStyle: "default",
				customBlurredBackground: true,
			};
		case "abacate":
			return {
				customBackgroundColor: "#14532d",
				customBackgroundGradient: "",
				customTextColor: "#a3e635",
				customFont: "font-satoshi",
				customButtonColor: "#a3e635",
				customButtonTextColor: "#14532d",
				customButtonStyle: "solid",
				customButtonFill: "filled",
				customButtonCorners: "12",
				headerStyle: "default",
				customBlurredBackground: true,
			};
		case "menta":
			return {
				customBackgroundColor: "#0f172a",
				customBackgroundGradient: "",
				customTextColor: "#4ade80",
				customFont: "font-satoshi",
				customButtonColor: "#134e4a",
				customButtonTextColor: "#4ade80",
				customButtonStyle: "solid",
				customButtonFill: "filled",
				customButtonCorners: "12",
				headerStyle: "default",
				customBlurredBackground: true,
			};
		case "vinho":
			return {
				customBackgroundColor: "#450a0a",
				customBackgroundGradient: "",
				customTextColor: "#ffffff",
				customFont: "font-satoshi",
				customButtonColor: "#b91c1c",
				customButtonTextColor: "#ffffff",
				customButtonStyle: "solid",
				customButtonFill: "filled",
				customButtonCorners: "12",
				headerStyle: "default",
				customBlurredBackground: true,
			};
		case "ember":
			return {
				customBackgroundColor: "#431407",
				customBackgroundGradient: "",
				customTextColor: "#facc15",
				customFont: "font-satoshi",
				customButtonColor: "#ca8a04",
				customButtonTextColor: "#431407",
				customButtonStyle: "solid",
				customButtonFill: "filled",
				customButtonCorners: "12",
				headerStyle: "default",
				customBlurredBackground: true,
			};
		case "lux":
			return {
				customBackgroundColor: "",
				customBackgroundGradient:
					"linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
				customTextColor: "#ffffff",
				customFont: "font-satoshi",
				customButtonColor: "#facc15",
				customButtonTextColor: "#ffffff",
				customButtonStyle: "solid",
				customButtonFill: "outlined",
				customButtonCorners: "12",
				headerStyle: "default",
				customBlurredBackground: true,
			};
		case "pulse":
			return {
				customBackgroundColor: "#e11d48",
				customBackgroundGradient: "",
				customTextColor: "#bef264",
				customFont: "font-satoshi",
				customButtonColor: "#84cc16",
				customButtonTextColor: "#000000",
				customButtonStyle: "solid",
				customButtonFill: "filled",
				customButtonCorners: "12",
				headerStyle: "default",
				customBlurredBackground: true,
			};
		case "mistico":
			return {
				customBackgroundColor: "#7c3aed",
				customBackgroundGradient: "",
				customTextColor: "#6ee7b7",
				customFont: "font-satoshi",
				customButtonColor: "#10b981",
				customButtonTextColor: "#6ee7b7",
				customButtonStyle: "solid",
				customButtonFill: "filled",
				customButtonCorners: "12",
				headerStyle: "default",
				customBlurredBackground: true,
			};
		case "artistic":
			return {
				customBackgroundColor: "#f5f0e8",
				customBackgroundGradient: "",
				customTextColor: "#6d4c41",
				customFont: "font-playfair-display",
				customButtonColor: "#f5f0e8",
				customButtonTextColor: "#6d4c41",
				customButtonStyle: "solid",
				customButtonFill: "outlined",
				customButtonCorners: "12",
				headerStyle: "default",
				customBlurredBackground: true,
			};
		case "unique":
			return {
				customBackgroundColor: "",
				customBackgroundGradient:
					"linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
				customTextColor: "#f43f5e",
				customFont: "font-satoshi",
				customButtonColor: "#53354a",
				customButtonTextColor: "#f43f5e",
				customButtonStyle: "solid",
				customButtonFill: "filled",
				customButtonCorners: "12",
				headerStyle: "default",
				customBlurredBackground: true,
			};
		case "neon":
			return {
				customBackgroundColor: "",
				customBackgroundGradient:
					"linear-gradient(135deg, #312e81 0%, #7c2d12 50%, #be185d 100%)",
				customTextColor: "#ffffff",
				customFont: "font-satoshi",
				customButtonColor: "#be185d",
				customButtonTextColor: "#ffffff",
				customButtonStyle: "neon",
				customButtonFill: "outlined",
				customButtonCorners: "12",
				headerStyle: "default",
				customBlurredBackground: true,
			};
		case "retro":
			return {
				customBackgroundColor: "#f4f1de",
				customBackgroundGradient: "",
				customTextColor: "#3d405b",
				customFont: "font-poppins",
				customButtonColor: "#f2cc8f",
				customButtonTextColor: "#3d405b",
				customButtonStyle: "solid",
				customButtonFill: "filled",
				customButtonCorners: "12",
				headerStyle: "default",
				customBlurredBackground: true,
			};
		case "modern":
			return {
				customBackgroundColor: "#0a0a0a",
				customBackgroundGradient: "",
				customTextColor: "#ffffff",
				customFont: "font-inter",
				customButtonColor: "#171717",
				customButtonTextColor: "#ffffff",
				customButtonStyle: "solid",
				customButtonFill: "filled",
				customButtonCorners: "12",
				headerStyle: "default",
				customBlurredBackground: true,
			};
		case "vibrant":
			return {
				customBackgroundColor: "",
				customBackgroundGradient:
					"linear-gradient(135deg, #c026d3 0%, #7c3aed 50%, #2563eb 100%)",
				customTextColor: "#ffffff",
				customFont: "font-satoshi",
				customButtonColor: "",
				customButtonTextColor: "#000000",
				customButtonStyle: "solid",
				customButtonFill: "gradient",
				customButtonCorners: "12",
				headerStyle: "default",
				customBlurredBackground: true,
			};
		case "cyber":
			return {
				customBackgroundColor: "#000000",
				customBackgroundGradient: "",
				customTextColor: "#00fff7",
				customFont: "font-inter",
				customButtonColor: "#00fff7",
				customButtonTextColor: "#ff00a5",
				customButtonStyle: "neon",
				customButtonFill: "outlined",
				customButtonCorners: "12",
				headerStyle: "default",
				customBlurredBackground: true,
			};
		default:
			return {
				customBackgroundColor: "",
				customBackgroundGradient:
					"linear-gradient(to bottom, #fafafa, #e5e5e5)",
				customTextColor: "#000000",
				customFont: "font-satoshi",
				customButtonColor: "#ffffff",
				customButtonTextColor: "#000000",
				customButtonStyle: "solid",
				customButtonFill: "filled",
				customButtonCorners: "12",
				headerStyle: "default",
				customBlurredBackground: true,
			};
	}
}

export function getDefaultCustomPresets() {
	return {
		customBackgroundColor: "",
		customBackgroundGradient: "linear-gradient(to bottom, #fafafa, #e5e5e5)",
		customTextColor: "#000000",
		customFont: "font-satoshi",
		customButtonColor: "#ffffff",
		customButtonTextColor: "#000000",
		customButtonStyle: "solid",
		customButtonFill: "filled",
		customButtonCorners: "12",
		headerStyle: "default",
		customBlurredBackground: true,
	};
}

export function getTemplateInfo(templateId: string) {
	const templates = {
		default: { name: "Padrão", category: "classicos" },
		simple: { name: "Simples", category: "classicos" },
		abacate: { name: "Abacate", category: "classicos" },
		menta: { name: "Menta", category: "classicos" },
		vinho: { name: "Vinho", category: "unicos" },
		ember: { name: "Ember", category: "unicos" },
		pulse: { name: "Pulse", category: "unicos" },
		mistico: { name: "Místico", category: "unicos" },
		artistic: { name: "Artístico", category: "criativo" },
		unique: { name: "Único", category: "criativo" },
		neon: { name: "Neon", category: "criativo" },
		retro: { name: "Retrô", category: "criativo" },
		modern: { name: "Moderno", category: "moderno" },
		vibrant: { name: "Vibrante", category: "moderno" },
		lux: { name: "Luxuoso", category: "moderno" },
		cyber: { name: "Cyberpunk", category: "moderno" },
	};

	return (
		templates[templateId as keyof typeof templates] || {
			name: "Padrão",
			category: "classicos",
		}
	);
}
