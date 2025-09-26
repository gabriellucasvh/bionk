export interface TemplatePreset {
	customBackgroundColor: string;
	customBackgroundGradient: string;
	customTextColor: string;
	customFont: string;
	customButton: string;
	customButtonFill: string;
	customButtonCorners: string;
	headerStyle: string;
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
				customButton: "#ffffff",
				customButtonStyle: "solid",
				customButtonFill: "filled",
				customButtonCorners: "12",
				headerStyle: "default",
			};
		case "simple":
			return {
				customBackgroundColor: "#000000",
				customBackgroundGradient: "",
				customTextColor: "#22c55e",
				customFont: "font-satoshi",
				customButton: "#16a34a",
				customButtonStyle: "solid",
				customButtonFill: "filled",
				customButtonCorners: "12",
				headerStyle: "default",
			};
		case "abacate":
			return {
				customBackgroundColor: "#14532d",
				customBackgroundGradient: "",
				customTextColor: "#a3e635",
				customFont: "font-satoshi",
				customButton: "#a3e635",
				customButtonStyle: "solid",
				customButtonFill: "filled",
				customButtonCorners: "12",
				headerStyle: "default",
			};
		case "menta":
			return {
				customBackgroundColor: "#0f172a",
				customBackgroundGradient: "",
				customTextColor: "#4ade80",
				customFont: "font-satoshi",
				customButton: "#134e4a",
				customButtonStyle: "solid",
				customButtonFill: "filled",
				customButtonCorners: "12",
				headerStyle: "default",
			};
		case "vinho":
			return {
				customBackgroundColor: "#450a0a",
				customBackgroundGradient: "",
				customTextColor: "#ffffff",
				customFont: "font-satoshi",
				customButton: "#b91c1c",
				customButtonStyle: "solid",
				customButtonFill: "filled",
				customButtonCorners: "12",
				headerStyle: "default",
			};
		case "ember":
			return {
				customBackgroundColor: "#431407",
				customBackgroundGradient: "",
				customTextColor: "#facc15",
				customFont: "font-satoshi",
				customButton: "#ca8a04",
				customButtonStyle: "solid",
				customButtonFill: "filled",
				customButtonCorners: "12",
				headerStyle: "default",
			};
		case "lux":
			return {
				customBackgroundColor: "",
				customBackgroundGradient:
					"linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
				customTextColor: "#ffffff",
				customFont: "font-satoshi",
				customButton: "#facc15",
				customButtonStyle: "solid",
				customButtonFill: "outlined",
				customButtonCorners: "12",
				headerStyle: "default",
			};
		case "pulse":
			return {
				customBackgroundColor: "#e11d48",
				customBackgroundGradient: "",
				customTextColor: "#bef264",
				customFont: "font-satoshi",
				customButton: "#84cc16",
				customButtonStyle: "solid",
				customButtonFill: "filled",
				customButtonCorners: "12",
				headerStyle: "default",
			};
		case "mistico":
			return {
				customBackgroundColor: "#7c3aed",
				customBackgroundGradient: "",
				customTextColor: "#6ee7b7",
				customFont: "font-satoshi",
				customButton: "#10b981",
				customButtonStyle: "solid",
				customButtonFill: "filled",
				customButtonCorners: "12",
				headerStyle: "default",
			};
		case "artistic":
			return {
				customBackgroundColor: "#f5f0e8",
				customBackgroundGradient: "",
				customTextColor: "#6d4c41",
				customFont: "font-playfair-display",
				customButton: "#f5f0e8",
				customButtonStyle: "solid",
				customButtonFill: "outlined",
				customButtonCorners: "12",
				headerStyle: "default",
			};
		case "unique":
			return {
				customBackgroundColor: "",
				customBackgroundGradient:
					"linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
				customTextColor: "#f43f5e",
				customFont: "font-satoshi",
				customButton: "#53354a",
				customButtonStyle: "solid",
				customButtonFill: "filled",
				customButtonCorners: "12",
				headerStyle: "default",
			};
		case "neon":
			return {
				customBackgroundColor: "",
				customBackgroundGradient:
					"linear-gradient(135deg, #312e81 0%, #7c2d12 50%, #be185d 100%)",
				customTextColor: "#ffffff",
				customFont: "font-satoshi",
				customButton: "#111111",
				customButtonStyle: "solid",
				customButtonFill: "outlined",
				customButtonCorners: "12",
				headerStyle: "default",
			};
		case "retro":
			return {
				customBackgroundColor: "#f4f1de",
				customBackgroundGradient: "",
				customTextColor: "#3d405b",
				customFont: "font-poppins",
				customButton: "#f2cc8f",
				customButtonStyle: "solid",
				customButtonFill: "filled",
				customButtonCorners: "0",
				headerStyle: "default",
			};
		case "modern":
			return {
				customBackgroundColor: "#0a0a0a",
				customBackgroundGradient: "",
				customTextColor: "#ffffff",
				customFont: "font-inter",
				customButton: "#171717",
				customButtonStyle: "solid",
				customButtonFill: "filled",
				customButtonCorners: "12",
				headerStyle: "default",
			};
		case "vibrant":
			return {
				customBackgroundColor: "",
				customBackgroundGradient:
					"linear-gradient(135deg, #c026d3 0%, #7c3aed 50%, #2563eb 100%)",
				customTextColor: "#ffffff",
				customFont: "font-satoshi",
				customButton: "",
				customButtonStyle: "solid",
				customButtonFill: "gradient",
				customButtonCorners: "12",
				headerStyle: "default",
			};
		case "cyber":
			return {
				customBackgroundColor: "#000000",
				customBackgroundGradient: "",
				customTextColor: "#00fff7",
				customFont: "font-inter",
				customButton: "#111111",
				customButtonStyle: "solid",
				customButtonFill: "outlined",
				customButtonCorners: "0",
				headerStyle: "default",
			};
		default:
			return {
				customBackgroundColor: "",
				customBackgroundGradient:
					"linear-gradient(to bottom, #fafafa, #e5e5e5)",
				customTextColor: "#000000",
				customFont: "font-satoshi",
				customButton: "#ffffff",
				customButtonStyle: "solid",
				customButtonFill: "filled",
				customButtonCorners: "12",
				headerStyle: "default",
			};
	}
}

export function getDefaultCustomPresets() {
	return {
		customBackgroundColor: "",
		customBackgroundGradient: "linear-gradient(to bottom, #fafafa, #e5e5e5)",
		customTextColor: "#000000",
		customFont: "font-satoshi",
		customButton: "#ffffff",
		customButtonStyle: "solid",
		customButtonFill: "filled",
		customButtonCorners: "12",
		headerStyle: "default",
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
